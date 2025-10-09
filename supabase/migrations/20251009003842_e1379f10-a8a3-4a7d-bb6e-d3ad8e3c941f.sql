-- Add is_manual_booking field to bookings table to differentiate manual bookings from automatic ones
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_manual_booking boolean NOT NULL DEFAULT false;

-- Add status_history to track booking status changes
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes text;

-- Update RLS policies to allow admins to manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);