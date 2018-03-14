let auctionClass = new AuctionClass();
auctionClass.LoadAuctions();

function AuctionClass()
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

    this.currentAuctionID = undefined;

    this.LoadAuctions = function()
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
        linkRefreshList.appendChild(linkRefreshText);
        auctionListNav.appendChild(linkRefreshList);

        
        let spanSortBy = document.createElement("span");
        let spanSortByText = document.createTextNode("- Sort By: ");
        spanSortBy.appendChild(spanSortByText);
        auctionListNav.appendChild(spanSortBy);

        let linkSortByEndDate = document.createElement("a");
        let linkSortByEndDateText = document.createTextNode("Slut Datum");
        linkSortByEndDate.appendChild(linkSortByEndDateText);
        linkSortByEndDate.setAttribute("href", function() { SortByEndDate(); } );
        auctionListNav.appendChild(linkSortByEndDate);

        let spanDivider = document.createElement("span");
        let spanDividerText = document.createTextNode(" / ");
        spanDivider.appendChild(spanDividerText);
        auctionListNav.appendChild(spanDivider);

        let linkSortByStartingPrice = document.createElement("a");
        let linkSortByStartingPriceText = document.createTextNode("Utropspris");
        linkSortByStartingPrice.appendChild(linkSortByStartingPriceText);
        linkSortByStartingPrice.setAttribute("href", function() { SortByStartingPrice(); } );
        auctionListNav.appendChild(linkSortByStartingPrice);

    }

    this.HandleAuctionData = function(aData)
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

    this.PresentAuctionAsHTML = function(aAuction)
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

    this.CheckBid = function(aAuktionID)
    {
        console.log(aAuktionID);
        return;
        let bidURL = "http://nackowskis.azurewebsites.net/api/Bud/700/";
        let bidToMatch = 0;
        let auktionID = aAuktionID; //This needs to be updated to valid ID dependentant on auction
    
        if (this.inputBid.value.length > 0)
        {
            let bidAmount = parseInt(this.inputBid.value);
            if (Number.isInteger(bidAmount) == true)
            {       
                if (bidAmount > bidToMatch)
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
                    })  
                }
            }
            else
            {
                document.getElementById("auction-bidmessage").innerHTML = "Bid of amount: " + bidAmount + " was lower than highest bid (" + bidToMatch + ").";
            }
        }
    }
    
    this.CreateAuction = function()
    {
        let titleMinLegth = 3;
        let descriptionLengthMin = 10;
    
        let auctionURL = "http://nackowskis.azurewebsites.net/api/Auktion/700/";
    
        let auctionTitle = skapaTitel.value;
        let auctionDescription = "";
        let auctionStartDate = "2018-03-10T00:00:00";
        let auctionEndDate = "2018-03-17T00:00:00";1
        let auctionGroupCode = 700;
        let auctionStartingPrice = skapaUtropspris;
    
        let auctionTitleLength = auctionTitle.value.length > titleMinLegth;
        let auctionDescruptionLength = auctionDescription.value.length > descriptionLengthMin;
        let startingPriceAboveZero = auctionStartingPrice > 0;
    
        if (!auctionTitleLength || !auctionDescruptionLength || !startingPriceAboveZero)
        {
            skapaError = "<strong class='red'>ERROR: </strong><span class='red'>"
    
            if (!auctionTitleLength) { skapaError += "Title should be minimum " + titleMinLegth + " characters <br>"; }
            if (!auctionDescruptionLength) { skapaError += "Description should be minimum " + descriptionLengthMin + " characters <br>"; }
            if (!startingPriceAboveZero) { skapaError += "Starting price must be above 0. <br>"; }
    
            return;
        }
    
        let jsonData = { AuktionID: 0, Titel: auctionTitle, Beskrivning: auctionDescription, StartDatum: 0, SlutDatum: 0, GruppKod: auctionGroupCode, Utropspris: auctionStartingPrice };  
        fetch(auctionURL,
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
                //Show something somewhere that says we added an auction.
        })  
    }

    this.DeleteAuction = function()
    {
        //No Code Yet
    }

    this.GetAuction = function(aID)
    {
        return this.auctions.find(auction => auction.auctionID === aID);
    }

    this.ShowAuction = function(aID)
    {
        this.divAuctionDetails.remove("hide");

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

        auction.FillAuctionCard(this.pID, this.pTitle, this.pDescription, this.pStartDate, this.pEndDate, this.pStartingPrice, this.btnBidSubmit);

        //Hide List
    }
}


function Auction(aAuction)
{
    this.auctionID = aAuction.AuktionID;
    this.title = aAuction.Titel;
    this.description = aAuction.Beskrivning;
    this.startDate = aAuction.StartDatum;
    this.endDate = aAuction.SlutDatum;
    this.startingPrice = aAuction.Utropspris;
    this.grpCode = aAuction.Gruppkod;
    this.bids = new Array();

    this.FillAuctionCard = function(aIDElement, aTitleElement, aDescElement, aStartDateElement, aEndDateElement, aStartingPriceElement, aBidButton)
    {
        aIDElement.innerHTML = "<strong>Auktion ID: </strong>" + this.auctionID;
        aTitleElement.innerHTML = "<strong>Titel: </strong>" + this.title;
        aDescElement.innerHTML = "<strong>Beskrivning: </strong>" + this.description;
        aStartDateElement.innerHTML = "<strong>Start Datum: </strong>" + this.startDate;
        aEndDateElement.innerHTML = "<strong>Slut Datum: </strong>" + this.endDate;
        aStartingPriceElement.innerHTML = "<strong>Utropspris: </strong>" + this.startingPrice;

        //Update Bid Button 
        
        aBidButton.addEventListener("click", () => { auctionClass.CheckBid(this.auctionID) }); 
    }

    this.ClearBids = function()
    {
        this.bids = new Array();
    }

    this.LoadBids = function(aBidsURL)
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

    this.SaveBids = function(aData)
    {
        for (bid of aData)
        {
            let newBid = new Bid(bid);
            this.bids.push(newBid);
        }
    }

    this.SortBids = function() 
    {
        if (this.bids.length > 0)
        {
            this.bids.sort(function(a, b) { return b.summa-a.summa; });
        }
    }

    this.GetHighestBid = function()
    {
        if (this.bids.length > 0)
        {
           return this.bids[0].sum;
        }

        return 0; 
    }
}

function Bid(aBidData)
{
    this.bidID = aBidData.BudID;
    this.sum = aBidData.Summa;
    this.auctionID = aBidData.AuktionID;
}

function CreateCountdown(aEndTime, aElement)
{
    let countDownDate = new Date(aEndTime).getTime();

    var x = setInterval(function() 
    {

        var now = new Date().getTime();
        var distance = countDownDate - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        aElement.innerHTML = "Countdown: " + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

        if (distance < 0) 
        {
            clearInterval(x);
            element.innerHTML = "EXPIRED";
        }
    }, 1000);
}


//Dunno why but hey I did it this way...

SortByEndDate()
{
    auctionClass.SortByEndDate();
}

SortByStartingPrice()
{
    auctionClass.SortByStartingPrice();
}