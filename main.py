from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agents.agentic_workflow import GraphBuilder
from utils.save_to_document import save_document

from starlette.responses import JSONResponse
import os
import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from supabase import create_client, Client
load_dotenv()

app = FastAPI()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Error initializing Supabase: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class QueryRequest(BaseModel):
    question: str

@app.post("/query")
async def query_travel_agent(query:QueryRequest, request: Request):
    try:
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            if supabase:
                try:
                    user_resp = supabase.auth.get_user(token)
                    if user_resp and user_resp.user:
                        user_id = user_resp.user.id
                except Exception as auth_err:
                    print(f"Auth error: {auth_err}")
                    
        print(query)
        graph = GraphBuilder(model_provider="openai")
        react_app=graph()
        #react_app = graph.build_graph()

        png_graph = react_app.get_graph().draw_mermaid_png()
        with open("my_graph.png", "wb") as f:
            f.write(png_graph)

        print(f"Graph saved as 'my_graph.png' in {os.getcwd()}")
        # Assuming request is a pydantic object like: {"question": "your text"}
        messages={"messages": [query.question]}
        output = react_app.invoke(messages)

        # If result is dict with messages:
        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content  # Last AI response
        else:
            final_output = str(output)
            
        # Save to Supabase if configured and user is authenticated
        if supabase and user_id:
            try:
                supabase.table("trips").insert({
                    "user_id": user_id,
                    "destination": query.question,
                    "plan_json": final_output
                }).execute()
                print("Trip plan saved to Supabase securely!")
            except Exception as db_err:
                print(f"Failed to save to Supabase: {db_err}")
        elif not user_id:
            print("Skipped saving trip: User not authenticated.")
        
        return {"answer": final_output}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})