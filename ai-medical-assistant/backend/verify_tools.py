import os
from dotenv import load_dotenv

load_dotenv()

print("=== Starting Diagnostic Check ===\n")

# 1. Test RAG / Vector Store
print("1. Testing Vector Store (RAG)...")
try:
    from app.tools.vector_store import get_retriever
    retriever = get_retriever()
    if retriever:
        docs = retriever.invoke("headache")
        print(f"   [SUCCESS] RAG returned {len(docs)} documents.")
    else:
        print("   [CRITICAL] RAG Retriever returned None. Is the database initialized?")
except Exception as e:
    print(f"   [CRITICAL] RAG Error: {e}")

# 2. Test Wikipedia
print("\n2. Testing Wikipedia...")
try:
    from app.tools.wikipedia_search import get_wikipedia_wrapper
    wiki = get_wikipedia_wrapper()
    if wiki:
        res = wiki.run("Headache")
        print(f"   [SUCCESS] Wikipedia returned data (length: {len(res)} chars).")
    else:
        print("   [CRITICAL] Wikipedia wrapper returned None.")
except Exception as e:
    print(f"   [CRITICAL] Wikipedia Error: {e}\n   (Hint: 'pip install wikipedia')")

# 3. Test Tavily
print("\n3. Testing Tavily...")
try:
    from app.tools.tavily_search import get_tavily_search
    tavily = get_tavily_search()
    if tavily:
        res = tavily.invoke("Latest migraine treatments 2024")
        print(f"   [SUCCESS] Tavily returned {len(res)} results.")
    else:
        print("   [CRITICAL] Tavily wrapper returned None. Is TAVILY_API_KEY in .env?")
except Exception as e:
    print(f"   [CRITICAL] Tavily Error: {e}")

print("\n=== Diagnostic Check Complete ===")
