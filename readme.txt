To Install:

run from backend folder:
pip install -r requirements.txt

to start the backend server run:
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

To get auth:
create a .env file in your backend folder, fill in the correct info:

GOOGLE_APPLICATION_CREDENTIALS=PATH\TO\KEY.json
GOOGLE_CLOUD_PROJECT=eduatlas-#####
GOOGLE_CLOUD_LOCATION=#####

To set up Electron app:

run in command prompt from frontend\EduAtlas App:
npm install
npm run dev
