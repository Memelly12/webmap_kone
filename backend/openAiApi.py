from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from openai import OpenAI
import base64
import json

router = APIRouter()


@router.post("/detect_constructions/")
async def detect_constructions(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(status_code=400, detail="Formats autorisés : JPEG, PNG, GIF, WEBP.")

    try:
        # Lire et encoder l'image en base64
        image_bytes = await file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = file.content_type
        data_url = f"data:{mime_type};base64,{base64_image}"

        #Appel à l'API GPT-4o
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                                "Tu es un expert en analyse cadastrale. Ta mission est d'identifier TOUS les bâtiments qui dépassent ou sont situés en dehors des limites cadastrales (marquées en rouge)."

                                "Pour chaque construction non-conforme, analyse méticuleusement l'image et crée un objet JSON avec les champs suivants:"
                               " 1.numeroLot: le numéro du lot le plus proche ou associé à la construction irrégulière"
                                "2. position: indique précisément où se trouve la construction par rapport aux limites (Nord, Sud, Est, Ouest, Nord-Est, etc.)"
                                "3. description: décris la construction en détail (taille, couleur et matériau de toiture, forme distincte)"
                                "4. gravite: évalue le degré de dépassement (léger, modéré, important, construction entièrement hors limite)"

                                "IMPORTANT:"
                                "- Analyse SYSTÉMATIQUEMENT chaque périmètre rouge visible dans l'image"
                                "- Concentre-toi spécifiquement sur les structures qui traversent ou dépassent les lignes rouges"
                                "- Examine attentivement les bords de l'image où des constructions pourraient être partiellement visibles"
                                "- Pour chaque numéro de lot visible, vérifie si des constructions associées dépassent les limites"

                                "Retourne uniquement une liste d'objets JSON sans texte explicatif."

                    )
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Voici l'image à analyser."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {"type": "text", "text": "Niveau d'analyse : 1"}  # Ajout du niveau
                    ]
                }
            ],
            max_tokens=1200
        )
        # Appel à l'API GPT-4o
        # response = client.responses.create(
        #     model="gpt-4o",
        #     input=[
        #         {
        #             "type": "text",
        #             "text": (
        #                 "Tu es un assistant d'urbanisme. Pour chaque construction visible "
        #                 "qui ne semble pas incluse dans une délimitation de lot, "
        #                 "produis un objet JSON contenant deux champs : "
        #                 "`numeroLot` (le numéro du lot le plus proche) et `description` "
        #                 "(où se situe approximativement cette construction par rapport au lot). "
        #                 "Retourne uniquement une liste d'objets JSON."
        #             )
        #         },
        #         {
        #             "type": "image_url",
        #             "image_url": {"url": data_url},
        #             "detail":"high"  # Pour améliorer les performances de vision
        #         }
        #     ],
            
        # )

        # # Afficher la réponse
        # print(response.output.text)

        output = response.choices[0].message.content
        print(output)
        output = json.loads(output)
        return JSONResponse(content={"lots": output})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
