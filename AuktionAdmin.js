class Auction
{
    constructor(aData)
    {
        this.auctionID = aData.AuktionID;
        this.title = aData.Titel;
        this.description = aData.Beskrivning;
        this.startDate = aData.StartDatum;
        this.endDate = aData.SlutDatum;
        this.startingPrice = aData.Utropspris;
        this.grpCode = aData.Gruppkod;
        this.bids = new Array();

        this.div = null;
        this.divEdit = null;
    }
}

class AuctionAdmin
{
    constructor()
    {    
        this.auctionsURL = "http://nackowskis.azurewebsites.net/api/Auktion/700/";
        this.bidsURL = "http://nackowskis.azurewebsites.net/api/Bud/700/";

        this.auctions = new Array();

        this.divAuctionList = document.getElementById("auction-list");

        this.bidIDs = new Array();
    }

    Initialize()
    {
        let btnCreate = document.getElementById("auction-button-create");
        btnCreate.addEventListener("click", () => auctionAdmin.CreateAuction() );

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

    ReloadAuctions()
    {
        this.auctions = new Array();

        this.ClearDOMChildrens(this.divAuctionList);

        this.ClearInputFields();

        this.LoadAuctions();
    }

    HandleAuctionData(aData)
    {
        for (let auction of aData)
        {
            let newAuction = new Auction(auction);
            this.auctions.push(newAuction); 

            //Load bids

            this.PopulateAuctionList(newAuction);
        }
    }

    PopulateAuctionList(aAuction)
    {
        aAuction.div = document.createElement("div");
        aAuction.div.setAttribute("class", "auction-item");

        let divAuctionTitle = document.createElement("div");
        divAuctionTitle.setAttribute("class", "auction-item-title");
        divAuctionTitle.innerHTML = "<strong>" + aAuction.title + "</strong>";
        aAuction.div.appendChild(divAuctionTitle);

        let divAuctionEdit = document.createElement("div");
        divAuctionEdit.setAttribute("class", "auction-item-edit");
        let linkAuctionEdit = document.createElement("a");
        linkAuctionEdit.setAttribute("href", "javascript:void(0)" );
        let linkAuctionEditText = document.createTextNode("ÄNDRA");
        linkAuctionEdit.appendChild(linkAuctionEditText);
        linkAuctionEdit.addEventListener("click", () => auctionAdmin.ShowEditDiv(aAuction.auctionID));
        divAuctionEdit.appendChild(linkAuctionEdit);

        aAuction.div.appendChild(divAuctionEdit);

        let divAuctionDelete = document.createElement("div");
        divAuctionDelete.setAttribute("class", "auction-item-delete");
        let linkAuctionDelete = document.createElement("a");
        linkAuctionDelete.setAttribute("href", "javascript:void(0)" );
        let linkAuctionDeleteText = document.createTextNode("TA BORT");
        linkAuctionDelete.appendChild(linkAuctionDeleteText);
        linkAuctionDelete.addEventListener("click", () => auctionAdmin.DeleteItem(aAuction.auctionID));
        divAuctionDelete.appendChild(linkAuctionDelete);

        aAuction.div.appendChild(divAuctionDelete);

        this.divAuctionList.appendChild(aAuction.div);
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
            
            createError.innerHTML += "<hr>";

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
                createError.innerHTML = "<strong>Auktion skapad.</strong><hr>";

                this.ReloadAuctions();
        }.bind(this))  
    }

    ShowEditDiv(aID)
    {
        if (this.divEdit !== null && this.divEdit !== undefined)
        {
            this.ClearDOMChildrens(this.divEdit);
        }

        let auctionPos = this.auctions.map(function(auction) { return auction.auctionID; }).indexOf(aID); 
        let auction = this.auctions[auctionPos];

        let divAuctionEditDetails = document.createElement("div");
        divAuctionEditDetails.setAttribute("id", "auction-edit-details");
        auction.div.appendChild(divAuctionEditDetails);

        divAuctionEditDetails.appendChild(document.createElement("hr"));

        let labelTitle = document.createElement("label");
        labelTitle.setAttribute("for", "auction-edit-title");
        labelTitle.innerHTML = "<strong>Titel: </strong>";
        divAuctionEditDetails.appendChild(labelTitle);

        divAuctionEditDetails.appendChild(document.createElement("br"));

        let inputTitle = document.createElement("input");
        inputTitle.setAttribute("type", "text");
        inputTitle.setAttribute("id", "auction-edit-title");
        inputTitle.setAttribute("value", auction.title);
        divAuctionEditDetails.appendChild(inputTitle);

        divAuctionEditDetails.appendChild(document.createElement("br"));

        let labelDescription = document.createElement("label");
        labelDescription.setAttribute("for", "auction-edit-description");
        labelDescription.innerHTML = "<strong>Beskrivning: </strong>";
        divAuctionEditDetails.appendChild(labelDescription);
        
        divAuctionEditDetails.appendChild(document.createElement("br"));

        let textArea = document.createElement("textarea");
        textArea.setAttribute("id", "auction-edit-description");
        let textAreaNode = document.createTextNode(auction.description);
        textArea.appendChild(textAreaNode);
        divAuctionEditDetails.appendChild(textArea);

        divAuctionEditDetails.appendChild(document.createElement("br"));
        
        let labelStartingPrice = document.createElement("label");
        labelStartingPrice.setAttribute("for", "auction-edit-startingprice");
        labelStartingPrice.innerHTML = "<strong>Utropspris: </strong>";
        divAuctionEditDetails.appendChild(labelStartingPrice);

        divAuctionEditDetails.appendChild(document.createElement("br"));

        let inputStaringPrice = document.createElement("input");
        inputStaringPrice.setAttribute("type", "number");
        inputStaringPrice.setAttribute("id", "auction-edit-startingprice");
        inputStaringPrice.setAttribute("value", auction.startingPrice);
        divAuctionEditDetails.appendChild(inputStaringPrice);
        
        divAuctionEditDetails.appendChild(document.createElement("br"));

        let labelStartDate = document.createElement("label");
        labelStartDate.setAttribute("for", "auction-edit-startdate");
        labelStartDate.innerHTML = "<strong>Start Datum: </strong>";
        divAuctionEditDetails.appendChild(labelStartDate);

        divAuctionEditDetails.appendChild(document.createElement("br"));

        let inputStartDate = document.createElement("input");
        inputStartDate.setAttribute("type", "datetime-local");
        inputStartDate.setAttribute("id", "auction-edit-startdate");
        inputStartDate.disabled = true;
        divAuctionEditDetails.appendChild(inputStartDate);

        divAuctionEditDetails.appendChild(document.createElement("br"));
        
        let labelEndDate = document.createElement("label");
        labelEndDate.setAttribute("for", "auction-edit-enddate");
        labelEndDate.innerHTML = "<strong>Slut Datum: </strong>";
        divAuctionEditDetails.appendChild(labelEndDate);

        divAuctionEditDetails.appendChild(document.createElement("br"));

        let inputEndDate = document.createElement("input");
        inputEndDate.setAttribute("type", "date");
        inputEndDate.setAttribute("id", "auction-edit-enddate");
        divAuctionEditDetails.appendChild(inputEndDate);
    
        let inputEndTime = document.createElement("input");
        inputEndTime.setAttribute("type", "time");
        inputEndTime.setAttribute("id", "auction-edit-endtime");
        divAuctionEditDetails.appendChild(inputEndTime);
        
        divAuctionEditDetails.appendChild(document.createElement("br"));
        divAuctionEditDetails.appendChild(document.createElement("br"));

        let editButton = document.createElement("button");
        let editButtonText = document.createTextNode("Ändra Auktion");
        editButton.appendChild(editButtonText);
        divAuctionEditDetails.appendChild(editButton);
        editButton.addEventListener("click", () => auctionAdmin.EditAuction(aID));

        divAuctionEditDetails.appendChild(document.createElement("hr"));

        this.divEdit = divAuctionEditDetails;

        inputStartDate.setAttribute("value", auction.startDate);

        let endDate = auction.endDate.substring(0, 10);
        inputEndDate.setAttribute("value", endDate);

        let endTime = auction.endDate.substring(11, 16);
        inputEndTime.setAttribute("value", endTime);
    }

    CreateElementAndAppendTo(aString, anElement)
    {
        let element = document.createElement(aString);
        anElement.appendChild(element);

        return element;
    }

    EditAuction(aID)
    {
        let titleMinLegth = 3;
        let descriptionLengthMin = 10;
        let timezoneOffset = (new Date()).getTimezoneOffset() * 60000;;
    
        let auctionID = aID;
        let auctionTitle = document.getElementById("auction-edit-title").value;
        let auctionDescription = document.getElementById("auction-edit-description").value;
        let auctionStartDate = document.getElementById("auction-edit-startdate").value;
        let auctionEndDate = new Date(Date.now() - timezoneOffset);
        let auctionGroupCode = 700;
        let auctionStartingPrice = document.getElementById("auction-edit-startingprice").value;
    
        let auctionTitleLength = auctionTitle.length > titleMinLegth;
        let auctionDescruptionLength = auctionDescription.length > descriptionLengthMin;
        let startingPriceAboveZero = auctionStartingPrice > 0;
    
        if (!auctionTitleLength || !auctionDescruptionLength || !startingPriceAboveZero)
        {
            let createError = document.getElementById("auction-message-delete");
            createError.innerHTML = "<strong class='red'>ERROR: </strong><span class='red'>"
    
            if (!auctionTitleLength) { createError.innerHTML += "Title should be minimum " + titleMinLegth + " characters <br>"; }
            if (!auctionDescruptionLength) { createError.innerHTML += "Description should be minimum " + descriptionLengthMin + " characters <br>"; }
            if (!startingPriceAboveZero) { createError.innerHTML += "Starting price must be above 0. <br>"; }
            
            createError.innerHTML += "<hr>";

            console.log("ERROR!");

            return;
        }
        
        auctionEndDate.setFullYear(document.getElementById("auction-edit-enddate").value.substring(0, 4));
        auctionEndDate.setMonth(document.getElementById("auction-edit-enddate").value.substring(5, 7)-1);
        auctionEndDate.setDate(document.getElementById("auction-edit-enddate").value.substring(8, 10));
        auctionEndDate.setHours(document.getElementById("auction-edit-endtime").value.substring(0, 2));
        auctionEndDate.setMinutes(document.getElementById("auction-edit-endtime").value.substring(3, 5));
    
        let jsonData = { AuktionID: auctionID, Titel: auctionTitle, Beskrivning: auctionDescription, StartDatum: auctionStartDate, SlutDatum: auctionEndDate.toISOString().slice(0, -5), GruppKod: auctionGroupCode, Utropspris: auctionStartingPrice };  

        console.log(jsonData);

        return;

        fetch(this.auctionsURL + auctionID,
            {
                method: 'PUT',
                body: JSON.stringify(jsonData),
                headers: 
                {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                }
            }).then(function (data) {

                
                let editMessage = document.getElementById("auction-message-delete");
                editMessage.innerHTML = "Auktionen är ändrad. <hr>";
        
                this.ClearDOMChildrens(this.divEdit);
                this.divEdit = null;

                this.ReloadAuctions();
        }.bind(this))  
    }


    ClearDOMChildrens(aElement) 
    {
        while (aElement.firstChild) 
        {
            aElement.removeChild(aElement.firstChild);
        }
    }

    async DeleteItem(aID)
    {
        console.log("Deleting auction ID: " +  aID);

        let gotBids = await this.GetBids(aID);
    }

 /*   async Delete()
    {
        console.log("Deleting auction ID: " +  this.selectListDelete.value);

        let gotBids = await this.GetBids(this.selectListDelete.value);
    }*/

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
            }).then(function (response) 
            {
                if (response.status !== 200 && response.status !== 204) 
                {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }

                let createError = document.getElementById("auction-message-delete");
                createError.innerHTML = "<strong>Auktion med ID: </strong>" +  aID + " <strong>togs bort.</strong><hr>";

                let auctionPos = this.auctions.map(function(auction) { return auction.auctionID; }).indexOf(aID); 

                this.ClearDOMChildrens(this.auctions[auctionPos].div);
                this.auctions[auctionPos].div.parentNode.removeChild(this.auctions[auctionPos].div);

                this.auctions.splice(auctionPos, 1);
            }.bind(this));  
    }

    ClearInputFields()
    {
        document.getElementById("auction-title").value = "";
        document.getElementById("auction-description").value = "";
        document.getElementById("auction-startingprice").value = "1";

        let endDate = document.getElementById("auction-dateend"); 
        endDate.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(0, 10);

        let endTime = document.getElementById("auction-timeend"); 
        endTime.value = new Date(dateNow.getTime() - dateNow.getTimezoneOffset() * 60000).toISOString().substring(11, 16);
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
