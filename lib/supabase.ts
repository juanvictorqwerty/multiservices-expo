import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hmasdqjdtkfarxdckzbz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYXNkcWpkdGtmYXJ4ZGNremJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDcwMTEsImV4cCI6MjA2NzY4MzAxMX0.VfzOtp6_g55L9x8HsRycPufFLKJ1XWW5Cejm0RYHpNM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})