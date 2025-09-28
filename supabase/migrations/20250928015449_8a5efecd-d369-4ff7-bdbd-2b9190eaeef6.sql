-- Create enums first
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdraw_status') THEN
        CREATE TYPE withdraw_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
    END IF;
END $$;

-- Add parents table
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing tables to support new structure
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_id UUID;

-- Add bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL,
    student_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    subject TEXT NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    hourly_rate INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    tutor_notes TEXT,
    student_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tutor availability table
CREATE TABLE IF NOT EXISTS public.tutor_availability (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add withdraw requests table
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    status withdraw_status NOT NULL DEFAULT 'pending',
    bank_account TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Update reviews table to include parent_id and booking_id
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS parent_id UUID,
ADD COLUMN IF NOT EXISTS booking_id UUID;

-- Add new columns to teachers table
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS teaching_method TEXT[] DEFAULT ARRAY['online', 'offline'],
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS total_earnings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_balance INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parents
CREATE POLICY "Parents can view own profile" ON public.parents
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert own profile" ON public.parents
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile" ON public.parents
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.parents WHERE id = bookings.parent_id
        UNION
        SELECT user_id FROM public.teachers WHERE id = bookings.tutor_id
    )
);

CREATE POLICY "Parents can create bookings" ON public.bookings
FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.parents WHERE id = bookings.parent_id)
);

CREATE POLICY "Tutors and parents can update bookings" ON public.bookings
FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM public.parents WHERE id = bookings.parent_id
        UNION
        SELECT user_id FROM public.teachers WHERE id = bookings.tutor_id
    )
);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.parents WHERE id = payments.parent_id)
);

-- RLS Policies for tutor availability
CREATE POLICY "Anyone can view tutor availability" ON public.tutor_availability
FOR SELECT USING (true);

CREATE POLICY "Tutors can manage own availability" ON public.tutor_availability
FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.teachers WHERE id = tutor_availability.tutor_id)
);

-- RLS Policies for withdraw requests
CREATE POLICY "Tutors can manage own withdraw requests" ON public.withdraw_requests
FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.teachers WHERE id = withdraw_requests.tutor_id)
);

-- Add triggers for updated_at
CREATE TRIGGER update_parents_updated_at
BEFORE UPDATE ON public.parents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();