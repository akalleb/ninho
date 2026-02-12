from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
# Note: In a real production environment, you might want to handle initialization errors
# or use dependency injection.
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None

def verify_supabase_token(token: str):
    """
    Verify the token by calling Supabase Auth API.
    Returns the user object if valid, None otherwise.
    """
    if not supabase:
        print("Supabase client not initialized")
        return None
        
    try:
        # Supabase-py's get_user expects the token
        response = supabase.auth.get_user(token)
        return response.user
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
