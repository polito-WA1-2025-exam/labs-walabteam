# Group "GROUP NAME"

## Members
- s331427 GIORZA SARA

# Exercise "MEME GAME"

# Lab Journal


URL: `/api/random3Cards`
HTTP Method: GET.
Description: Retrieve 3 random cards.
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cardss in JSON format. Else, returns an error message.
Response body:
[
  {
    "id": 1,
    "situation": "Shark Attack! Lose one arm and one leg",
    "image": "https://d3fa68hw0m2vcc.cloudfront.net/f47/200227261.jpeg",
    "index": 96.5
  },
  ...
]

URL: `/api/randomCard/<ids>`
HTTP Method: GET.
Description: Retrieve a random card not being one among the given cards with a fake index (0)
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cards in JSON format. Else, returns an error message.
Response body:
  {
    "id": 1,
    "situation": "Shark Attack! Lose one arm and one leg",
    "image": "https://d3fa68hw0m2vcc.cloudfront.net/f47/200227261.jpeg",
    "index": 0
  }

URL: `/api/cardIndex/<id>`
HTTP Method: GET.
Description: Retrieve the index of a card given its id
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). In case of success, returns an array of cards in JSON format. Else, returns an error message.
Response body: { 5 }

URL: `/api/cardIndex/<id>`
HTTP Method: POST.
Description: Upload info on game
Response: `200 OK` (success) or `500 Internal Server Error` (generic error). 
Request body:

Response body: 
