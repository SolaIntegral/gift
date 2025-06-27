from flask import Flask, request, jsonify
import boto3
import json

app = Flask(__name__)

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    body = {
        "messages": [{"role": "user", "content": user_message}],
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 512
    }

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps(body),
        contentType="application/json"
    )

    completion = json.loads(response["body"].read())
    reply = completion["content"][0]["text"]
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)