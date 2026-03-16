-- RLS Policies for Gunaso Portal

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS UUID AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================
-- DEPARTMENTS POLICIES
-- =====================
-- Everyone can view departments
CREATE POLICY "departments_select_all" ON public.departments
  FOR SELECT USING (true);

-- Only admins can modify departments
CREATE POLICY "departments_insert_admin" ON public.departments
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "departments_update_admin" ON public.departments
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "departments_delete_admin" ON public.departments
  FOR DELETE USING (public.get_user_role() = 'admin');

-- =====================
-- PROFILES POLICIES
-- =====================
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Department officers can view citizen profiles (for assigned complaints)
CREATE POLICY "profiles_select_officer" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() = 'department_officer' 
    AND role = 'citizen'
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- =====================
-- COMPLAINTS POLICIES
-- =====================
-- Citizens can view their own complaints
CREATE POLICY "complaints_select_own" ON public.complaints
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all complaints
CREATE POLICY "complaints_select_admin" ON public.complaints
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Department officers can view complaints assigned to their department
CREATE POLICY "complaints_select_officer" ON public.complaints
  FOR SELECT USING (
    public.get_user_role() = 'department_officer'
    AND assigned_department_id = public.get_user_department()
  );

-- Citizens can insert their own complaints
CREATE POLICY "complaints_insert_citizen" ON public.complaints
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Citizens can update their own pending complaints (limited)
CREATE POLICY "complaints_update_own" ON public.complaints
  FOR UPDATE USING (
    user_id = auth.uid() 
    AND status = 'pending'
  );

-- Admins can update any complaint
CREATE POLICY "complaints_update_admin" ON public.complaints
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- Department officers can update assigned complaints
CREATE POLICY "complaints_update_officer" ON public.complaints
  FOR UPDATE USING (
    public.get_user_role() = 'department_officer'
    AND assigned_department_id = public.get_user_department()
    AND status IN ('assigned', 'in-progress')
  );

-- =====================
-- COMPLAINT HISTORY POLICIES
-- =====================
-- Users can view history of their own complaints
CREATE POLICY "history_select_own" ON public.complaint_history
  FOR SELECT USING (
    complaint_id IN (SELECT id FROM public.complaints WHERE user_id = auth.uid())
  );

-- Admins can view all history
CREATE POLICY "history_select_admin" ON public.complaint_history
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Officers can view history of assigned complaints
CREATE POLICY "history_select_officer" ON public.complaint_history
  FOR SELECT USING (
    public.get_user_role() = 'department_officer'
    AND complaint_id IN (
      SELECT id FROM public.complaints 
      WHERE assigned_department_id = public.get_user_department()
    )
  );

-- Admins and officers can insert history
CREATE POLICY "history_insert_admin_officer" ON public.complaint_history
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'department_officer')
  );

-- =====================
-- NOTIFICATIONS POLICIES
-- =====================
-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System/admins can insert notifications for any user
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('admin', 'department_officer')
    OR user_id = auth.uid()
  );
