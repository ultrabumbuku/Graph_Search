import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
def get_related_words(query_word, depth=2):
    if depth == 0:
        return []

    prompt = f"テーマ「{query_word}」に関連する、または類似している単語やフレーズを5個リストアップしてください。このとき、{query_word}がどういうものなのか（具体例：人名・組織・会社・大学など）について強く意識し、同じ文脈で出てくる、比較対象になりうるものについては必ず列挙するようにしてください。（具体例：大谷翔平であればアーロンジャッジ、筑波大学であれば東京大学、知識情報・図書館学類であれば情報メディア創成学類など）。確実に、単語で答えてください。説明は要りません。"

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    related_words = response.choices[0].message.content.strip().split('\n')
    
    nodes = [{"id": query_word, "label": query_word}]
    links = []
    
    for word in related_words:
        word = word.strip()
        nodes.append({"id": word, "label": word})
        links.append({"source": query_word, "target": word})
        
        # 再帰的に関連ワードを取得
        if depth > 1:
            sub_graph = get_related_words(word, depth - 1)
            nodes.extend(sub_graph['nodes'])
            links.extend(sub_graph['links'])
    
    return {"nodes": nodes, "links": links}