const bidSafety = true;
const maxBid = 50; // in dollars
const itemId = 190265905; // Item ID

// Place Bid
async function placeBid(itemId: number, sellerId: number, bidAmount: number) {
  const response = await fetch(
    "https://buyerapi.shopgoodwill.com/api/ItemBid/PlaceBid",
    {
      headers: {
        accept: "application/json",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NWMzYWQ3NS03YzZmLTQ2YjgtYWZiMS1kMGNlYzA2MTZhMjMiLCJCdXllcklkIjoiNDQ4MjYzOSIsIk1pZGRsZUluaXRpYWwiOiIiLCJJcEFkZHJlc3MiOiIxNzMuODguMTEwLjQ0IiwiQnJvd3NlciI6ImNocm9tZSIsIk1vYlJlZ2lzdHJhdGlvblRva2VuIjoiIiwiTW9iQXBwUGxhdGZvcm0iOiIiLCJNb2JBcHBWZXJzaW9uIjoiIiwiTW9iQnJhbmQiOiIiLCJNb2JNb2RlbCI6IiIsIkJ1eWVyU2Vzc2lvbiI6IjU1YzNhZDc1LTdjNmYtNDZiOC1hZmIxLWQwY2VjMDYxNmEyMyIsImV4cCI6MTcwOTkxNTg4MCwiaXNzIjoiaHR0cHM6Ly9idXllcnByb2RtdmMub2Nnb29kd2lsbC10ZWNoc2VydmljZXMub3JnLyIsImF1ZCI6Imh0dHBzOi8vYnV5ZXJwcm9kbXZjLm9jZ29vZHdpbGwtdGVjaHNlcnZpY2VzLm9yZy8ifQ.Be1lilsRk59G4hCfO-r3MzXIF3LpUL3UjG__yvX1u4s",
        "content-type": "application/json",
        "sec-ch-ua": '"Chromium";v="121", "Not A(Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
      referrer: "",
      referrerPolicy: "no-referrer",
      body: `{"itemId":${itemId},"quantity":1,"sellerId":${sellerId},"bidAmount":${bidAmount}}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    },
  );
  return response.json();
}

// Get Item Detail
async function getItemDetail(itemId: number) {
  const response = await fetch(
    `https://buyerapi.shopgoodwill.com/api/ItemDetail/GetItemDetailModelByItemId/${itemId}`,
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NWMzYWQ3NS03YzZmLTQ2YjgtYWZiMS1kMGNlYzA2MTZhMjMiLCJCdXllcklkIjoiNDQ4MjYzOSIsIk1pZGRsZUluaXRpYWwiOiIiLCJJcEFkZHJlc3MiOiIxNzMuODguMTEwLjQ0IiwiQnJvd3NlciI6ImNocm9tZSIsIk1vYlJlZ2lzdHJhdGlvblRva2VuIjoiIiwiTW9iQXBwUGxhdGZvcm0iOiIiLCJNb2JBcHBWZXJzaW9uIjoiIiwiTW9iQnJhbmQiOiIiLCJNb2JNb2RlbCI6IiIsIkJ1eWVyU2Vzc2lvbiI6IjU1YzNhZDc1LTdjNmYtNDZiOC1hZmIxLWQwY2VjMDYxNmEyMyIsImV4cCI6MTcwOTkxNTg4MCwiaXNzIjoiaHR0cHM6Ly9idXllcnByb2RtdmMub2Nnb29kd2lsbC10ZWNoc2VydmljZXMub3JnLyIsImF1ZCI6Imh0dHBzOi8vYnV5ZXJwcm9kbXZjLm9jZ29vZHdpbGwtdGVjaHNlcnZpY2VzLm9yZy8ifQ.Be1lilsRk59G4hCfO-r3MzXIF3LpUL3UjG__yvX1u4s",
        "content-type": "application/json",
        "sec-ch-ua": '"Chromium";v="121", "Not A(Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
      },
      referrerPolicy: "no-referrer",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    },
  );

  return response.json();
}

function convertTimeToSeconds(remainingTime: string): number {
  const timeRegex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
  const match = remainingTime.match(timeRegex);

  if (!match) {
    console.error("Invalid time format");
  }

  const days = match[1] ? parseInt(match[1], 10) : 0;
  const hours = match[2] ? parseInt(match[2], 10) : 0;
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  const seconds = match[4] ? parseInt(match[4], 10) : 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

try {
  while (true) {
    const itemDetail = await getItemDetail(itemId);
    const timeLeft = convertTimeToSeconds(itemDetail.remainingTime);
    // get difference in milliseconds
    const display = {
      title: itemDetail.title,
      itemId: itemDetail.itemId,
      numberOfBids: itemDetail.numberOfBids,
      remainingTime: itemDetail.remainingTime,
      bidIncrement: itemDetail.bidIncrement,
      startingPrice: itemDetail.startingPrice,
      currentPrice: itemDetail.currentPrice,
      minimumBid: itemDetail.minimumBid,
      isHighBidderLogIn: itemDetail.bidHistory.isHighBidderLogIn,
      timeLeft: timeLeft,
      serverTime: itemDetail.serverTime,
      bidSafety: bidSafety,
    };

    console.log(display);

    if (itemDetail.bidHistory.auctionClosed) {
      console.log("Auction has ended");
      break;
    } else if (
      timeLeft < 4 &&
      itemDetail.minimumBid < 50 &&
      !bidSafety &&
      !itemDetail.bidHistory.isHighBidderLogIn
    ) {
      console.log("Bidding now");
      const bidAmount = itemDetail.minimumBid + itemDetail.bidIncrement;
      const response = await placeBid(
        itemDetail.itemId,
        itemDetail.sellerId,
        bidAmount,
      );
      console.log(response);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
} catch (error) {
  console.error(error);
}
