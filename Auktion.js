let auctionClass = new AuctionClass();
auctionClass.LoadAuctions();

class AuctionClass
{
    constructor()
    {
        this.auctionsURL = "https://nackowskis.azurewebsites.net/api/Auktion/700/";
        this.bidsURL = "https://nackowskis.azurewebsites.net/api/Bud/700/";
    
        this.auctions = new Array();
    
        this.divAuctionList = document.getElementById("auction-list");
        this.divAuctionDetails = document.getElementById("auction-details");
    
        this.pID = document.getElementById("auction-id");
        this.pTitle = document.getElementById("auction-title");
        this.pDescription = document.getElementById("auction-description");
        this.pStartDate = document.getElementById("auction-startdate");
        this.pEndDate = document.getElementById("auction-enddate");
        this.pCountDown = document.getElementById("auction-countdown");
        this.pStartingPrice = document.getElementById("auction-startingprice");
        this.pHighestBid = document.getElementById("auction-highestbid");
        this.pNumBids = document.getElementById("auction-numbids");
    
        this.btnBidSubmit = document.getElementById("btn-bidsubmit");
    
        this.inputBid = document.getElementById("auction-bidinput");
        this.inputSearch = document.getElementById("input-search");
        
        let btnSearch = document.getElementById("btn-search");
        btnSearch.addEventListener("click", () => { auctionClass.Search(); } );
    
        this.aLinkShowAllBids = document.getElementById("auction-showallbids");
    
        this.currentAuctionID = undefined;
    
        this.countdown = new CountDown();
    }

    LoadAuctions()
    {
       fetch(this.auctionsURL).then(
            function (response) 
            {
                if (response.status !== 200) 
                {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }

                response.json().then(
                    data => this.HandleAuctionData(data)
                );
            }.bind(this)
        ).catch(function (err) 
        {
            console.log('Fetch Error :-S', err);
        })

        
        let auctionListNav = document.getElementById("auction-list-nav");
        
        let linkRefreshList = document.createElement("a");
        let linkRefreshText = document.createTextNode("Uppdatera listan");
        linkRefreshList.setAttribute("href", "javascript:void(0)" );
        linkRefreshList.appendChild(linkRefreshText);
        auctionListNav.appendChild(linkRefreshList);

        
        let spanSortBy = document.createElement("span");
        spanSortBy.innerHTML = " - <strong>Sort By:</strong> ";
        auctionListNav.appendChild(spanSortBy);

        let linkSortByEndDate = document.createElement("a");
        let linkSortByEndDateText = document.createTextNode("Slut Datum");
        linkSortByEndDate.appendChild(linkSortByEndDateText);
        linkSortByEndDate.setAttribute("href", "javascript:void(0)" );
        linkSortByEndDate.addEventListener("click", () => { auctionClass.SortByEndDate() });
        auctionListNav.appendChild(linkSortByEndDate);

        let spanDivider = document.createElement("span");
        let spanDividerText = document.createTextNode(" / ");
        spanDivider.appendChild(spanDividerText);
        auctionListNav.appendChild(spanDivider);

        let linkSortByStartingPrice = document.createElement("a");
        let linkSortByStartingPriceText = document.createTextNode("Utropspris");
        linkSortByStartingPrice.appendChild(linkSortByStartingPriceText);
        linkSortByStartingPrice.setAttribute("href", "javascript:void(0)" );
        linkSortByStartingPrice.addEventListener("click", () => { auctionClass.SortByStartingPrice() });
        auctionListNav.appendChild(linkSortByStartingPrice);

    }

    HandleAuctionData(aData)
    {
        
        let divAuctionList = document.getElementById("auktion-list");
        for (let auction of aData)
        {
            let newAuction = new Auction(auction);
            newAuction.LoadBids(this.bidsURL);
            this.auctions.push(newAuction); 

            this.PresentAuctionAsHTML(newAuction);
        }
    }

    PresentAuctionAsHTML(aAuction)
    {
        let divAuctionList = document.getElementById("auction-list");

        let divAuctionListItem = document.createElement("div");
        divAuctionListItem.setAttribute("class", "auction-listitem");

        let auctionLink = document.createElement("a");
        let auctionLinkTitle = document.createTextNode(aAuction.title);
        auctionLink.appendChild(auctionLinkTitle);
        auctionLink.addEventListener("click", () => auctionClass.ShowAuction(aAuction.auctionID));
       

        divAuctionListItem.appendChild(auctionLink);

        let linebreak = document.createElement("br");
        divAuctionListItem.appendChild(linebreak);

        divAuctionList.appendChild(divAuctionListItem);
    }

    CheckBid(aAuktionID)
    {
        console.log(aAuktionID);

        let auction = this.GetAuction(aAuktionID);

        let bidURL = "http://nackowskis.azurewebsites.net/api/Bud/700/";
        let bidToMatch = auction.GetHighestBid();
        let startingPrice = auction.GetStartingPrice()
    
        if (this.inputBid.value.length > 0)
        {
            let bidAmount = parseInt(this.inputBid.value);
            if (Number.isInteger(bidAmount) == true)
            {       
                if (bidAmount < startingPrice)
                {
                    document.getElementById("auction-bidmessage").innerHTML = "Bid of amount: " + bidAmount + " was lower than starting bid (" + startingPrice + ").";
                }
                else if (bidAmount > bidToMatch)
                {
                    let jsonData = { BudID: 0, Summa: bidAmount, AuktionID: auktionID };  
                    fetch(bidURL + auktionID,
                    {
                        method: 'POST',
                        body: JSON.stringify(jsonData),
                        headers: 
                        {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                        }
                    }).then(function (data) {
                        console.log('Request success: ', 'posten skapad');
                        document.getElementById("auction-bidmessage").innerHTML = "Bid of amount: " + bidAmount + " was succesfully placed.";

                        
                        auction.ClearBids();
                        auction.LoadBids(this.bidsURL, this.pHighestBid);

                        this.inputBid.value = "";
                        
                    })  
                }
                else
                {
                    document.getElementById("auction-bidmessage").innerHTML = "Bid of amount: " + bidAmount + " was lower than highest bid (" + bidToMatch + ").";
                }
            }
        }
    }

    GetAuction(aID)
    {
        return this.auctions.find(auction => auction.auctionID === aID);
    }

    ShowAuction(aID)
    {
        this.divAuctionDetails.classList.remove("hide");

        let auction = this.GetAuction(aID);
        this.currentAuctionID = aID;

        this.inputBid.value = "";

        var clone = this.btnBidSubmit.cloneNode();
        while (this.btnBidSubmit.firstChild)
        {
          clone.appendChild(this.btnBidSubmit.lastChild);
        }
        this.btnBidSubmit.parentNode.replaceChild(clone, this.btnBidSubmit);
        this.btnBidSubmit = clone;

        auction.FillAuctionCard(this.pID, this.pTitle, this.pDescription, this.pStartDate, this.pEndDate, this.pCountDown, this.pStartingPrice, this.pHighestBid, this.pNumBids, this.inputBid, this.btnBidSubmit, this.aLinkShowAllBids, this.countdown);

    }

    SortByEndDate()
    {
        this.auctions.sort(function(a, b) { return new Date(b.endDate).getTime() - new Date(a.endDate).getTime(); });

        this.ClearDOMChildrens(this.divAuctionList);

        for (let auction of this.auctions)
        {
            this.PresentAuctionAsHTML(auction);
        }
    }

    SortByStartingPrice()
    {
        this.auctions.sort(function(a, b) { return b.startingPrice - a.startingPrice; });

        this.ClearDOMChildrens(this.divAuctionList);

        for (let auction of this.auctions)
        {
            this.PresentAuctionAsHTML(auction);
        }
    }

    Search()
    {
        let searchWord = this.inputSearch.value;

        if (searchWord > 0)
        {

        }
    }

    ClearDOMChildrens(aElement) 
    {
        while (aElement.firstChild) 
        {
            aElement.removeChild(aElement.firstChild);
        }
    }

}


class Auction
{
    constructor(aAuction)
    {
        this.auctionID = aAuction.AuktionID;
        this.title = aAuction.Titel;
        this.description = aAuction.Beskrivning;
        this.startDate = aAuction.StartDatum;
        this.endDate = aAuction.SlutDatum;
        this.startingPrice = aAuction.Utropspris;
        this.grpCode = aAuction.Gruppkod;
        this.bids = new Array();
    }

    FillAuctionCard(aIDElement, aTitleElement, aDescElement, aStartDateElement, aEndDateElement, aCoundDownElement, aStartingPriceElement, aHighestBidElement, aNumBidsElement, aInputBid, aBidButton, aShowAllBidsLink , aCountDown)
    {
        aIDElement.innerHTML = "<strong>Auktion ID: </strong>" + this.auctionID;
        aTitleElement.innerHTML = "<strong>Titel: </strong>" + this.title;
        aDescElement.innerHTML = "<strong>Beskrivning: </strong>" + this.description;
        aStartDateElement.innerHTML = "<strong>Start Datum: </strong>" + this.startDate;
        aEndDateElement.innerHTML = "<strong>Slut Datum: </strong>" + this.endDate;
        aStartingPriceElement.innerHTML = "<strong>Utropspris: </strong>" + this.startingPrice;
        aHighestBidElement.innerHTML = "<strong>Högsta bud: </strong>" + this.GetHighestBid();
        aNumBidsElement.innerHTML = "<strong>Antal bud: </strong>" + this.bids.length;


        var clone = aShowAllBidsLink.cloneNode();
        while (aShowAllBidsLink.firstChild)
        {
          clone.appendChild(aShowAllBidsLink.lastChild);
        }
        aShowAllBidsLink.parentNode.replaceChild(clone, aShowAllBidsLink);
        aShowAllBidsLink = clone;

        aShowAllBidsLink.innerHTML = "Visa alla bud";
        aShowAllBidsLink.addEventListener("click", () => { this.ShowAllBids() } );
        
        
        aCountDown.StopCountDown();
        aCountDown.StartCountdown(this.endDate, aCoundDownElement);

        //Update Bid Button 
        
        aBidButton.addEventListener("click", () => { auctionClass.CheckBid(this.auctionID) }); 

        if (this.IsExpired())
        {
            aBidButton.disabled = true;
            aInputBid.disabled = true;
        }
        else
        {
            aBidButton.disabled = false;
            aInputBid.disabled = false;
        }
    }

    ClearBids()
    {
        this.bids = new Array();
    }

    LoadBids(aBidsURL, aHighestBidElement)
    {
        fetch(aBidsURL + this.auctionID).then(
            function (response) 
            {
                if (response.status !== 200) 
                {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }

                response.json().then(
                    data => this.SaveBids(data)
                );
            }.bind(this)
        ).catch(function (err) 
        {
            console.log('Fetch Error :-S', err);
        });
    }

    SaveBids(aData)
    {
        for (bid of aData)
        {
            let newBid = new Bid(bid);
            this.bids.push(newBid);
        }

        this.SortBids();
    }

    SortBids() 
    {
        if (this.bids.length > 0)
        {
            this.bids.sort(function(a, b) { return b.sum-a.sum; });
        }

        this.UpdateHighestBid();
    }

    GetHighestBid()
    {
        if (this.bids.length > 0)
        {
           return this.bids[0].sum;
        }

        return 0; 
    }

    GetStartingPrice()
    {
        return this.startingPrice;
    }

    IsExpired()
    {
        return (new Date(this.endDate).getTime() - new Date().getTime() <= 0);
    }

    UpdateHighestBid()
    {
        let highestBidElement = document.getElementById("auction-highestbid");
        highestBidElement.innerHTML = "<strong>Högsta bud: </strong>" + this.GetHighestBid();
    }

    ShowAllBids()
    {
        let pAllBids = document.getElementById("auction-allbids");
        if (pAllBids !== null || pAllBids !== undefined)
        {
            pAllBids.innerHTML = "";
            for (let bid of this.bids)
            {
                pAllBids.innerHTML += "<strong>BudID:</strong> " + bid.bidID + " <strong>Summa:</strong> " + bid.sum + "<br>";
            }

        }
    }

    Search()
    {
        let searchResult = this.auctions.filter((obj) => obj["titel"].toUpperCase().indexOf(searchWord.toUpperCase()) > -1 || obj["beskrivning"].toUpperCase().indexOf(searchWord.toUpperCase()) > -1); 

        //Rensa listan

        //Fyll på med Sökresultat
    }

    ShowAllAuctions()
    {
        console.log("DO THIS CODE");
    }
}

class Bid
{
    constructor(aBidData)
    {
        this.bidID = aBidData.BudID;
        this.sum = aBidData.Summa;
        this.auctionID = aBidData.AuktionID;
    }
}

class CountDown 
{
    constructor()
    {
        this.countdown = null;        
    }

    StartCountdown(aEndTime, aElement) 
    {
        let countDownDate = new Date(aEndTime).getTime();
        let now = new Date().getTime();
        let distance = countDownDate - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) 
        {
            clearInterval(this.countdown);
            aElement.innerHTML = "<strong>Tid kvar: </strong><strong class='red'>AUKTION SLUT</strong>";
        }
        else
        {
            aElement.innerHTML = "<strong>Tid kvar:</strong> " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        }

        this.countdown = setInterval(function () 
        {
            let now = new Date().getTime();
            let distance = countDownDate - now;

            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) 
            {
                clearInterval(this.countdown);
                aElement.innerHTML = "<strong>Tid kvar: </strong><strong class='red'>AUKTION SLUT</strong>";
            }
            else
            {
                aElement.innerHTML = "<strong>Tid kvar:</strong> " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
            }
        }, 1000);
    }

    StopCountDown()
    {
        if (this.countdown !== null)
        {
            clearInterval(this.countdown);
            this.countdown = null;
        }
    }

}