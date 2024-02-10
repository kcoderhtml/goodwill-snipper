import { getItemDetail, getShippingCost, placeBid } from "./utils/api";
import { convertTimeToSeconds } from "./utils/conversions";

const bidSafety = process.env.GOODWILL_SNIPPER_BID_SAFETY || true;
const maxBid: number = +(process.env.GOODWILL_SNIPPER_MAX_BID || 0); // in dollars
const itemId: number = +(process.env.GOODWILL_SNIPPER_ITEM_ID || 0); // Item ID
const zipCode = process.env.GOODWILL_SNIPPER_ZIP_CODE || ""; // Zip Code
const bearerToken = process.env.GOODWILL_SNIPPER_BEARER_TOKEN || ""; // Bearer Token

try {
  const shippingCost = await getShippingCost(itemId, zipCode, bearerToken);
  while (true) {
    const itemDetail = await getItemDetail(itemId, bearerToken);
    const timeLeft = convertTimeToSeconds(itemDetail.remainingTime);

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
      maxBid: maxBid,
      shippinCost: shippingCost,
    };
    console.log(display);

    if (itemDetail.bidHistory.auctionClosed) {
      console.log("Auction has ended");
      break;
    } else if (
      timeLeft < 4 &&
      itemDetail.minimumBid < maxBid &&
      !bidSafety &&
      !itemDetail.bidHistory.isHighBidderLogIn
    ) {
      console.log("Bidding now");
      const bidAmount = itemDetail.minimumBid + itemDetail.bidIncrement;
      const response = await placeBid(
        itemDetail.itemId,
        itemDetail.sellerId,
        bidAmount,
        bearerToken,
      );
      console.log(response);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
} catch (error) {
  console.error(error);
}
