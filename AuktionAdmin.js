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
        this.auctionsURL = "http://nackowskis.azurewebsites.net/api/Auktion/700/";
        this.bidsURL = "http://nackowskis.azurewebsites.net/api/Bud/700/";

        this.auctions = new Array();

        this.selectListDelete = document.getElementById("auctions-selectlist");

        this.bidIDs = new Array();
    }

    Initialize()
    {
        let btnCreate = document.getElementById("auction-button-create");
        btnCreate.addEventListener("click", () => auctionAdmin.CreateAuction() );

        let btnDelete = document.getElementById("auction-button-delete"); 
        btnDelete.addEventListener("click", () => auctionAdmin.Delete() );

        this.LoadAuctions();

        let startDateTime = document.getElementById("auction-datetimestart"); 
        
        let dateNow = new Date();  
        startDateTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 19);
           
        let endDate = document.getElementById("auction-dateend"); 
        endDate.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 10);

        let endTime = document.getElementById("auction-timeend"); 
        endTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(11, 16);

        let startTimeUpdate = setInterval(function () 
        {
            let dateNow = new Date();  
            startDateTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 19);
        }, 1000);
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
        let timezoneOffset = (new Date()).getTimezoneOffset() * 60000;;
    
        let auctionTitle = document.getElementById("auction-title").value;
        let auctionDescription = document.getElementById("auction-description").value;
        let auctionStartDate = new Date(Date.now() - timezoneOffset).toISOString().slice(0, -5);
        let auctionEndDate = new Date(Date.now() - timezoneOffset);
        let auctionGroupCode = 700;
        let auctionStartingPrice = document.getElementById("auction-startingprice").value;
    
        let auctionTitleLength = auctionTitle.length > titleMinLegth;
        let auctionDescruptionLength = auctionDescription.length > descriptionLengthMin;
        let startingPriceAboveZero = auctionStartingPrice > 0;
    
        if (!auctionTitleLength || !auctionDescruptionLength || !startingPriceAboveZero)
        {
            let createError = document.getElementById("auction-message-create");
            createError.innerHTML = "<strong class='red'>ERROR: </strong><span class='red'>"
    
            if (!auctionTitleLength) { createError.innerHTML += "Title should be minimum " + titleMinLegth + " characters <br>"; }
            if (!auctionDescruptionLength) { createError.innerHTML += "Description should be minimum " + descriptionLengthMin + " characters <br>"; }
            if (!startingPriceAboveZero) { createError.innerHTML += "Starting price must be above 0. <br>"; }
    
            console.log("ERROR!");

            return;
        }
        
        auctionEndDate.setFullYear(document.getElementById("auction-dateend").value.substring(0, 4));
        auctionEndDate.setMonth(document.getElementById("auction-dateend").value.substring(5, 7)-1);
        auctionEndDate.setDate(document.getElementById("auction-dateend").value.substring(8, 10));
        auctionEndDate.setHours(document.getElementById("auction-timeend").value.substring(0, 2));
        auctionEndDate.setMinutes(document.getElementById("auction-timeend").value.substring(3, 5));
    
        let jsonData = { AuktionID: 0, Titel: auctionTitle, Beskrivning: auctionDescription, StartDatum: auctionStartDate, SlutDatum: auctionEndDate.toISOString().slice(0, -5), GruppKod: auctionGroupCode, Utropspris: auctionStartingPrice };  
        fetch(this.auctionsURL,
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
                
                let createError = document.getElementById("auction-message-create");
                createError.innerHTML = "<strong>Auction added.</strong>";
        })  
    }

    async Delete()
    {
        console.log("Deleting auction ID: " +  this.selectListDelete.value);

        let gotBids = await this.GetBids(this.selectListDelete.value);

        //Ta bort Auktion
        //let response = await this.DeleteAuction(this.selectListDelete.value);
        //console.log(response);
    }

    async GetBids(aID)
    {
        fetch(this.bidsURL + aID).then(
            function (response) 
            {
                if (response.status !== 200) 
                {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return false;
                }

                response.json().then(
                     data => this.SaveBids(aID, data)
                );
            }.bind(this)
        ).catch(function (err) 
        {
            console.log('Fetch Error :-S', err);
        });
    }

    async SaveBids(aID, aData)
    {
        this.bidIDs = new Array();
        for (let bid of aData)
        {
            await this.DeleteBid(bid.BudID);
        }

        this.DeleteAuction(aID);
    }

    async DeleteBid(aID)
    {
        return fetch(this.bidsURL + aID, {
                method: 'DELETE',
              });
    }

    async DeleteAuction(aID)
    {
        return fetch(this.auctionsURL + aID,
            {
                method: 'DELETE',
                headers: 
                {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
    }
}

let auctionAdmin = new AuctionAdmin();
auctionAdmin.Initialize();

class UberSafeLogin
{
    constructor()
    {
        this.username = "username";
        this.password = "password";

        this.inputUsername = document.getElementById("auction-username");
        this.inputPassword = document.getElementById("auction-password"); 

        this.divLogin = document.getElementById("auction-login");
        this.divCreate = document.getElementById("auction-create");
        this.divDelete = document.getElementById("auction-delete");

        this.divMessage = document.getElementById("auction-login-message");
        
        let btnLogin = document.getElementById("auction-button-login"); 
        btnLogin.addEventListener("click", () => this.CheckLogin() );

    }

    CheckLogin()
    {
        if (this.inputUsername.value === this.username && this.inputPassword.value === this.password)
        {
            this.Login();
        }
        else
        {
            this.divMessage.innerHTML = "Wrong Credentials.";
        }
    }

    Login()
    {
        this.divLogin.classList.add("hide");
        this.divCreate.classList.remove("hide");
        this.divDelete.classList.remove("hide");

        sessionStorage.loggedIn = true;
    }

    CheckSessionLogin()
    {
        if (sessionStorage.loggedIn == "true")
        {
            this.Login();
        }
    }

}

let login = new UberSafeLogin();
login.CheckSessionLogin();
