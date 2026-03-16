-- Triggers for Gunaso Portal

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_citizen_id TEXT;
BEGIN
  -- Generate citizen ID: CIT-YEAR-RANDOM
  new_citizen_id := 'CIT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    address,
    role,
    citizen_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'citizen'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'citizen') = 'citizen' 
      THEN new_citizen_id 
      ELSE NULL 
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate ticket number: GRV-YEAR-RANDOM
  NEW.ticket_no := 'GRV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
DROP TRIGGER IF EXISTS before_complaint_insert ON public.complaints;
CREATE TRIGGER before_complaint_insert
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.ticket_no IS NULL)
  EXECUTE FUNCTION public.generate_ticket_no();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to create notification on complaint status change
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification details based on new status
    CASE NEW.status
      WHEN 'in-review' THEN
        notification_title := 'Complaint Under Review';
        notification_message := 'Your complaint #' || NEW.ticket_no || ' is now being reviewed by an administrator.';
        notification_type := 'info';
      WHEN 'assigned' THEN
        notification_title := 'Complaint Assigned';
        notification_message := 'Your complaint #' || NEW.ticket_no || ' has been assigned to a department for resolution.';
        notification_type := 'info';
      WHEN 'in-progress' THEN
        notification_title := 'Complaint In Progress';
        notification_message := 'A department officer is actively working on your complaint #' || NEW.ticket_no || '.';
        notification_type := 'info';
      WHEN 'resolved' THEN
        notification_title := 'Complaint Resolved';
        notification_message := 'Your complaint #' || NEW.ticket_no || ' has been resolved. ' || COALESCE(NEW.resolution_notes, '');
        notification_type := 'success';
      WHEN 'rejected' THEN
        notification_title := 'Complaint Rejected';
        notification_message := 'Your complaint #' || NEW.ticket_no || ' has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided.');
        notification_type := 'error';
      ELSE
        RETURN NEW;
    END CASE;

    -- Insert notification
    INSERT INTO public.notifications (user_id, complaint_id, title, message, type)
    VALUES (NEW.user_id, NEW.id, notification_title, notification_message, notification_type);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notification on status change
DROP TRIGGER IF EXISTS on_complaint_status_change ON public.complaints;
CREATE TRIGGER on_complaint_status_change
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_status_change();
