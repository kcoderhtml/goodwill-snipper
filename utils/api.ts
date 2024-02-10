// Place Bid
export async function placeBid(
  itemId: number,
  sellerId: number,
  bidAmount: number,
  bearerToken: string,
) {
  const response = await fetch(
    "https://buyerapi.shopgoodwill.com/api/ItemBid/PlaceBid",
    {
      headers: {
        accept: "application/json",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization: `Bearer ${bearerToken}`,
        "content-type": "application/json",
      },
      referrer: "",
      referrerPolicy: "no-referrer",
      body: `{ "itemId": ${itemId}, "quantity": 1, "sellerId": ${sellerId}, "bidAmount": ${bidAmount}} `,
      method: "POST",
      mode: "cors",
      credentials: "include",
    },
  );
  return response.json();
}

// Get Item Detail
export async function getItemDetail(itemId: number, bearerToken: string) {
  const response = await fetch(
    `https://buyerapi.shopgoodwill.com/api/ItemDetail/GetItemDetailModelByItemId/${itemId}`,
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization: `Bearer ${bearerToken}`,
        "content-type": "application/json",
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

// get shipping cost
export async function getShippingCost(
  itemId: number,
  zipCode: string,
  bearerToken: string,
) {
  const response = await fetch(
    "https://buyerapi.shopgoodwill.com/api/ItemDetail/CalculateShipping",
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization: `Bearer ${bearerToken}`,
        "content-type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: `{"itemId":${itemId},"country":"US","province":null,"zipCode":"${zipCode}","quantity":1,"clientIP":""}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    },
  );

  const regex = /Total Shipping and Handling: \$([\d.]+)/;

  const text = await response.text();

  const match = text.match(regex);

  if (!match) {
    console.error("Invalid HTML format");
    return null;
  }

  return parseFloat(match[1]) || null;
}

// get favorite items
export async function getFavoriteItems(bearerToken: string) {
  const response = await fetch(
    "https://buyerapi.shopgoodwill.com/api/Favorite/GetAllFavoriteItemsByType?Type=all",
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        "access-control-allow-credentials": "true",
        "access-control-allow-origin": "*",
        authorization: `Bearer ${bearerToken}`,
        "content-type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: null,
      method: "POST",
      mode: "cors",
      credentials: "include",
    },
  );
  const json = await response.json();

  if (json && Array.isArray(json.data)) {
    // Extract 'title' and 'itemId' and format the data
    const formattedData = json.data
      .filter((item: any) => item.type === "Open")
      .map((item: any) => ({
        value: String(item.itemId),
        label: `${item.title} - ${item.numBids} bids`,
      }));

    // loop over data and add current bid amount and end date to label
    for (let i = 0; i < formattedData.length; i++) {
      const itemDetail = await getItemDetail(
        parseInt(formattedData[i].value),
        bearerToken,
      );

      let cost;
      if (itemDetail.bidHistory.isHighBidderLogIn) {
        cost = itemDetail.currentPrice;
      } else {
        cost = itemDetail.minimumBid;
      }

      let highbid;
      if (itemDetail.bidHistory.isHighBidderLogIn) {
        highbid = "✅";
      } else {
        highbid = "❌";
      }

      formattedData[i].label +=
        ` - $${cost} - ${highbid} - ${itemDetail.remainingTime} `;
    }

    return formattedData;
  } else {
    console.error("Invalid JSON format");
    return [];
  }
}
