import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

import { SharedService } from './shared.service';

@Injectable()
export class HbuddyService {

  private headers: Headers;
  private reqOptions: RequestOptions;

  constructor(private http: Http, private sharedService: SharedService) {
      this.refreshHeaders();
  }

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");

    if(this.sharedService.getCurrentUser() && this.sharedService.getCurrentUser().id){
      this.headers.append("Authorization", this.sharedService.getCurrentUser().id);
    }
    if(this.sharedService.getCurrentUser() && this.sharedService.getCurrentUser().token){
      this.headers.append("X-Access-Token", this.sharedService.getCurrentUser().token);      
    }

  }

   login(payload): Promise<any>{
     let POST_URL: string = environment.API_BASE_URL + "/MyUsers/login?include=user";
     if(!payload || !payload.params){
         return Promise.reject("INVALID DATA");
     }else{
         this.reqOptions = new RequestOptions({headers: this.headers});
         return this.http.post(POST_URL, payload.params, this.reqOptions)
         .toPromise()
         .then(this.extractData)
               .catch(this.handleErrorPromise);
     }
   }

   fetchUserGroups(userObj): Promise<any>{
        let ownerId: string = userObj.id;
 	    	if(userObj.userId){
 	    		ownerId = userObj.userId;
 	    	}
        if(!ownerId && userObj.uid){
            ownerId = userObj.uid;
        }
         if(!ownerId){
           return Promise.reject("<<< Cannot fetch Groups for an unknown ownerId >>>>> ");
         }
         let findReq: any = {
                             filter: {
     			    			  		            where: {"or": [{"members": {"elemMatch": {"userId": {"$eq": ownerId}}}},
     			    			  		                {"ownerId": ownerId}]}
     	    				   		             }
                             };
         let GET_URL: string = environment.API_BASE_URL + "/Groups?";
         this.refreshHeaders();
         this.reqOptions = new RequestOptions({headers: this.headers});
         this.reqOptions.params = findReq;
         return this.http.get(GET_URL, this.reqOptions)
         .toPromise()
 		    .then(this.extractData)
 	      .catch(this.handleErrorPromise);
   }

   fetchUserPlaces(userObj): Promise<any>{
     return this.fetchUserGroups(userObj).then( groups => {
         console.log("Fetched User Groups:  ", groups);
         userObj.groups = groups;
         let ownerId: string = userObj.id;
         if(userObj.userId){
           ownerId = userObj.userId;
         }
         if(!ownerId && userObj.uid){
             ownerId = userObj.uid;
         }
         if(!ownerId){
           return Promise.reject("<<< Cannot fetch Places for an unknown ownerId >>>>> ");
         }
         let findReq: any = {filter: {where: {or: [{ownerId: ownerId}]}}};
         let placeIds: Array<string> = [];
         for (let group of userObj.groups) {
             placeIds.push(group.placeId);
         }
         if(placeIds.length > 0){
           findReq.filter.where.or.push({id: {inq: placeIds}});
         }
         let GET_PLACES_URL: string = environment.API_BASE_URL + "/Places?";
         this.refreshHeaders();
         this.reqOptions = new RequestOptions({headers: this.headers});
         this.reqOptions.params = findReq;
           return this.http.get(GET_PLACES_URL, this.reqOptions)
           .toPromise()
   		    .then(this.extractData)
   	            .catch(this.handleErrorPromise);
     },
     error => {
         console.log("ERROR IN Fetching Groups: >> ", error);
         return this.handleErrorPromise(error);
     });
   }

   fetchPlaceAreas(selectedPlace): Promise<any>{
       let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
       let GET_URL: string = environment.API_BASE_URL + "/PlaceAreas?";
       this.refreshHeaders();
       this.reqOptions = new RequestOptions({headers: this.headers});
       this.reqOptions.params = findReq;
       return this.http.get(GET_URL, this.reqOptions)
       .toPromise()
       .then(this.extractData)
       .catch(this.handleErrorPromise);
   }

   fetchBoards(placeArea): Promise<any>{
     console.log("IN hbuddyProvider.fetchBoards: >> ", placeArea.id);

     let findReq: any = {
     				filter:{
         			  		 where: {"and": [{"connectedToId": placeArea.id},
         			  		                 {"status": "ACTIVE"}
         			  		 				]}
     								}
     						};
     let GET_URL: string = environment.API_BASE_URL + "/Boards?";
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     this.reqOptions.params = findReq;
     return this.http.get(GET_URL, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   fetchDevices(board): Promise<any>{
     console.log("IN hbuddyProvider.fetchDevices: >> ", board.id);

     let findReq: any = {
     				filter:{
         			  		 where: {"parentId": board.uniqueIdentifier}
     								}
     						};
     let GET_URL: string = environment.API_BASE_URL + "/Devices?";
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     this.reqOptions.params = findReq;
     return this.http.get(GET_URL, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   fetchScenes(selectedPlace): Promise<any>{

     let findReq: any = {filter: {where: {placeId: selectedPlace.id}}};
     let GET_URL: string = environment.API_BASE_URL + "/Scenes?";
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     this.reqOptions.params = findReq;
     return this.http.get(GET_URL, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   fetchPlaceGroups(placeId): Promise<any>{

         let findReq: any = {filter: {where: {placeId: placeId}}};
         let GET_URL: string = environment.API_BASE_URL + "/Groups?";
         this.reqOptions = new RequestOptions({headers: this.headers});
         this.reqOptions.params = findReq;
         return this.http.get(GET_URL, this.reqOptions)
         .toPromise()
 		    .then(this.extractData)
 	      .catch(this.handleErrorPromise);
   }

   savePlace(place): Promise<any>{
     let POST_URL: string = environment.API_BASE_URL + "/Places";
     if(place.id){
       POST_URL = POST_URL + "?id="+place.id;
     }
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     return this.http.put(POST_URL, place, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   savePlaceArea(placeArea): Promise<any>{
     let POST_URL: string = environment.API_BASE_URL + "/PlaceAreas";
     if(placeArea.id){
       POST_URL = POST_URL + "?id="+placeArea.id;
     }
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     return this.http.put(POST_URL, placeArea, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   saveBoard(board): Promise<any>{
     let POST_URL: string = environment.API_BASE_URL + "/Boards";
     if(board.id){
       POST_URL = POST_URL + "?id="+board.id;
     }
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     return this.http.put(POST_URL, board, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   callConversation(conversationReq): Promise<any>{
     let POST_URL: string = environment.API_BASE_URL + "/Conversations";
     if(!conversationReq || !conversationReq.params || !conversationReq.params.input){
       return Promise.reject("<<< Cannot call Conversation without Text ! >>>>> ");
     }
     console.log("IN hbuddyProvider.callConversation: >>> ", conversationReq);
     this.refreshHeaders();
     this.reqOptions = new RequestOptions({headers: this.headers});
     return this.http.post(POST_URL, conversationReq, this.reqOptions)
     .toPromise()
     .then(this.extractData)
           .catch(this.handleErrorPromise);
   }

   private extractData(res: Response) {
         let body = res.json();
         return body;
   }

   private handleErrorPromise (error: Response | any) {
 	     console.error(error.message || error);
        return Promise.reject(error.message || error);
   }

}
