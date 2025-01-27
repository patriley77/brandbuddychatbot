from google.oauth2 import service_account
from googleapiclient.discovery import build
import time

# Path to your service account JSON file
SERVICE_ACCOUNT_FILE = r"C:\brandbuddychat\brand-buddy-ai-cloud.json"
DOCUMENT_ID = "1_ZV5esmaJ8V6OzSd6QCFanMkK9mVyoND0QYjUkDNH4A"
CACHE_FILE = "cached_document.txt"

# Authenticate using service account
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=["https://www.googleapis.com/auth/documents.readonly"]
)
service = build("docs", "v1", credentials=credentials)

def fetch_document():
    """Fetch the document content and update the cache."""
    print("[INFO] Fetching latest document content...")
    doc = service.documents().get(documentId=DOCUMENT_ID).execute()
    
    content = ""
    for element in doc.get("body").get("content", []):
        if "paragraph" in element:
            for text in element["paragraph"]["elements"]:
                if "textRun" in text:
                    content += text["textRun"]["content"] + "\n"

    # Save the fetched content
    with open(CACHE_FILE, "w", encoding="utf-8") as file:
        file.write(content)
    
    print("[INFO] Document content updated.")

# Run once when script starts
fetch_document()

# Schedule to run every hour
while True:
    time.sleep(3600)  # 1 hour
    fetch_document()
