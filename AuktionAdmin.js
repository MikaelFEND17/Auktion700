let auctionAdmin = new AuctionAdmin();
auctionAdmin.Initialize();

function AuctionAdmin()
{
    this.auctions = new Array();

    this.Initialize = function()
    {
        let btnCreate = document.getElementById("aution-create");
        btnCreate.addEventListener("click", () => auctionAdmin.CreateAuction() );

        let btnDelete = document.getElementById("aution-delete"); 
        btnDelete.addEventListener("click", () => auctionAdmin.DeleteAuction() );
    }

    this.PopulateAuctionList = function()
    {

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
        console.log("Deleting auction ID: ");

        //Ta bort Bud

        //Ta bort Auktion
    }
}