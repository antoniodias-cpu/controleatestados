import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ymqcivhxbqgemeffvwtu.supabase.co/rest/v1/'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcWNpdmh4YnFnZW1lZmZ2d3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTcyOTMsImV4cCI6MjEwMTA3MzI5M30.Qfm_dcr1CWqfWA1I9MhkMFSKP7ZWXE1ZIWHPx6i1UIc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
