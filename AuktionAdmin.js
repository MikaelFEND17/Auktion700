class Auction
{
    constructor(aData)
    {
        this.title = aData.Titel;
        this.auctionID = aData.AuktionID;
    }
}

class AuctionAdmin
{
    constructor()
    {    
        this.auctionsURL = "https://nackowskis.azurewebsites.net/api/Auktion/700/";
        this.bidsURL = "https://nackowskis.azurewebsites.net/api/Bud/700/";

        this.auctions = new Array();

        this.selectListDelete = document.getElementById("auctions-selectlist");
    }

    Initialize()
    {
        let btnCreate = document.getElementById("aution-create");
        btnCreate.addEventListener("click", () => auctionAdmin.CreateAuction() );

        let btnDelete = document.getElementById("aution-delete"); 
        btnDelete.addEventListener("click", () => auctionAdmin.Delete() );

        this.LoadAuctions();

        let startDateTime = document.getElementById("auction-datetimestart"); 
        
        let dateNow = new Date();  
        startDateTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 19);
           
        let endDate = document.getElementById("auction-dateend"); 
        endDate.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 10);
        console.log(new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 10));

        let endTime = document.getElementById("auction-timeend"); 
        endTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(11, 16);
        console.log(new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(11, 16));

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
    }

    HandleAuctionData(aData)
    {
        let select
        for (let auction of aData)
        {
            let newAuction = new Auction(auction);
            this.auctions.push(newAuction); 

            this.PopulateAuctionList(newAuction);
        }
    }

    PopulateAuctionList(aAuction)
    {
        let option = new Option(aAuction.title, aAuction.auctionID);
        this.selectListDelete.appendChild(option);
    }

    CreateAuction()
    {
        let titleMinLegth = 3;
        let descriptionLengthMin = 10;
    
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

    async Delete()
    {
        console.log("Deleting auction ID: " +  this.selectListDelete.value);

        //Ta bort Bud
        let response1 = await this.DeleteBids(this.selectListDelete.value);

        //Ta bort Auktion
        let response2 = await this.DeleteAuction(this.selectListDelete.value);

        

        console.log(response1);
        //console.log(response2);
    }

    async DeleteBids(aID)
    {
        return fetch(this.bidsURL + aID,
            {
                method: 'DELETE',
                body: JSON.stringify({}),
                headers: 
                {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                }
            }).then(
                function (response) 
                {
                    if (response.status !== 200) 
                    {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
    
                    response.json().then(
                        console.log(data)
                    );
                }.bind(this)
            ).catch(function (err) 
            {
                console.log('Fetch Error :-S', err);
            })
    }

    async DeleteAuction(aID)
    {
        return fetch(this.auctionsURL + aID,
            {
                method: 'DELETE',
                body: JSON.stringify({}),
                headers: 
                {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                }
            }).then(
                function (response) 
                {
                    if (response.status !== 200) 
                    {
                        console.log('Looks like there was a problem. Status Code: ' + response.status);
                        return;
                    }
    
                    response.json().then(
                        console.log(data)
                    );
                }.bind(this)
            ).catch(function (err) 
            {
                console.log('Fetch Error :-S', err);
            })
    }
}

let auctionAdmin = new AuctionAdmin();
auctionAdmin.Initialize();

