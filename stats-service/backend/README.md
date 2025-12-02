# Stats Service Backend

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

```bash
cd api
python api.py
```

Or using uvicorn directly:
```bash
uvicorn api.api:app --reload --host 0.0.0.0 --port 8001
```

The API will be available at: http://localhost:8001

API Documentation: http://localhost:8001/docs
