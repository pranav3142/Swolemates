import pandas as pd
from supabase import create_client, Client
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os

load_dotenv(".env.local")

SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY") 


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_all_profiles_except(user_id):
    response = supabase.table("about").select("*").neq("user_id", user_id).execute()
    return response.data or []

def get_current_profile(user_id):
    response = supabase.table("about").select("*").eq("user_id", user_id).single().execute()
    return response.data

def get_top_buddies(current_user_id):
    current_profile = get_current_profile(current_user_id)
    if not current_profile:
        return []

    # Get all other profiles as a DataFrame
    all_profiles = get_all_profiles_except(current_user_id)
    if not all_profiles:
        return []

    df = pd.DataFrame(all_profiles)

    selected_features = ['age', 'location', 'goal', 'fitness_level']
    for feature in selected_features:
        if feature not in df:
            df[feature] = ''
        df[feature] = df[feature].fillna('').astype(str)

    # Add current user's profile to the top for vectorization
    user_row = {f: str(current_profile.get(f, "")) for f in selected_features}
    df_user = pd.DataFrame([user_row])
    df_full = pd.concat([df_user, df], ignore_index=True)

    # Combine selected features into one string
    df_full['combined_features'] = (
        df_full['age'] + ' ' +
        df_full['location'] + ' ' +
        df_full['fitness_level'] + ' ' +
        df_full['goal']
    )

    # TF-IDF and cosine similarity
    vectorizer = TfidfVectorizer()
    feature_vectors = vectorizer.fit_transform(df_full['combined_features'])
    similarity = cosine_similarity(feature_vectors)

    # The first row is the current user; get similarity scores to others
    similarity_scores = list(enumerate(similarity[0][1:]))  # exclude first (self)
    # Sort by similarity, highest first
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    # Get top N indexes (matching user_ids in df)
    top_n = 10
    top_indexes = [i for i, score in similarity_scores[:top_n]]

    # These correspond to rows 1..N in the original df (since 0 is the current user)
    top_user_ids = df.iloc[top_indexes]['user_id'].tolist()
    return top_user_ids
