from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

creds = Credentials.from_service_account_file(
    "service-account.json",
    scopes=["https://www.googleapis.com/auth/drive"],
)

drive_service = build('drive', 'v3', credentials=creds)

file_metadata = {
    'name': 'My Test',
    'parents': [''],  # Drive folder or Shared Drive Id
    'mimeType': 'application/vnd.google-apps.spreadsheet'
}
media = MediaFileUpload('test.csv',
                        mimetype='text/csv',
                        resumable=True)
file = drive_service.files().create(body=file_metadata,
                                    supportsAllDrives=True,
                                    media_body=media,
                                    fields='id').execute()
print(file)
