/* Fabric chaincode example
- Fabric chaincodes enable predefined agreements on how to append to the ledger to be possible
- we begin with importing shim package which has tools to Get and Set our ledger
- followed by the fabric peer pubsub protos which will act as the middleware between chaincode sandboxes and our api
- For more information on how we control who calls these functions
- please consult the apidocs in the routers
*/

package main

import (
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

/*invokable functions in our chaincode
this map will serve as a guide between whats called on the api and whats ran on the chaincode*/
// these functions are a set of read and write methods to model an assset transfer
var calderaFunctions = map[string]func(shim.ChaincodeStubInterface, []string) pb.Response{
	// methods to create user objects
	"create_artist": createArtist,
	"create_broker": createBroker,
	// we haven't touched our owner client yet
	// in our network extension section we will use it to complete our asset exchange workflow
	"create_owner": createOwner,

	// ~ Register Art
	// @ ./artist.go
	// input json {
	// 		name: string,
	// 		artist: string,
	// 		description: string
	// }
	// -> PutState
	// @ ./schema.go
	// Key: prefixArtist + []sring{ input.Artist }
	// Value: type Art struct {
	//   Name        string `json:"name"`
	//   Artist      string `json:"artist"`
	//   Description string `json:"description"`
	// }
	// != Output
	// grpc {
	//   Message: "Artwork, ${art.Name} has been registered"
	// }
	"register_art": registerArt,

	// ~ Post Art to Brokerage
	// ! Have an artist send a request to a broker user to sell a piece of art
	// @ ./artist.go
	// input json {
	//   Artist string
	//   Art    string
	//   Broker string
	//   Price  float64
	//   Margin float64
	//   UUID   string
	// }
	// -> PutState
	// @ ./schema.go
	// Key: prefixBrokerProposal + []string{ input.UUID }
	// Value: type BrokerProposal struct {
	//  	Artist   string  `json:"artist"`
	//    Art      string  `json:"art"`
	//    Broker   string  `json:"broker"`
	//    Price    float64 `json:"price"`
	//    Margin   float64 `json:"margin"`
	//    UUID     string  `json:"UUID"`
	//    Reviewed bool    `json:"reviewed"`
	//    Approved bool    `json:"approved"
	// }
	// ! Reviewed and Approved restricted to false
	// -> PutState
	// @ ./schema.go
	// Key: prefixBroker + []string{ input.Broker }
	// Value: type Broker struct {
	//     Name      string   `json:"name"`
	//     Username  string   `json:"username"`
	//     Password  string   `json:"password"`
	//     Inventory []string `json:"inventory"`
	//     Requests  []string `json:"requests"`
	//  }
	// ! broker.Requests = append(broker.Requests, input.UUID)
	//
	// != Output
	// grpc {
	//   Message: "Proposal for " + broker.Name + " to sell " + art.Name + " has been created and sent",
	// }
	"artist_send_brokerage_request": createArtistBrokerProposal,

	// ~ Get a list of proposals belonging to a broker
	// @ ./broker.go
	// input json struct {
	//	 Broker string `json:"broker"`
	// }
	// != Output
	// -> GetState
	// output grpc {
	//   [] -> GetState
	//     output grpc BrokerProposal {
	//      	Artist   string  `json:"artist"`
	//        Art      string  `json:"art"`
	//        Broker   string  `json:"broker"`
	//        Price    float64 `json:"price"`
	//        Margin   float64 `json:"margin"`
	//        UUID     string  `json:"UUID"`
	//        Reviewed bool    `json:"reviewed"`
	//        Approved bool    `json:"approved"`
	//     }
	//  }
	"get_brokerage_requests": queryBrokerageRequests,

	// ~ Accept Artist Proposal
	// ! A broker can accept the proposal of the artist and gain seller rights
	// @ ./broker.go
	// input json {
	//	UUID          string `json:"UUID"`
	//	UUIDInventory string `json:"inventoryUUID"`
	// }
	// -> PutState
	// @ ./scheema.go
	// Key: prefixBrokerProposal + []string{ input.UUID }
	// Value: #BrokerProposal
	// ! Value of #BrokerProposal.Reviewed = true
	// ! Value of #BrokerProsal.Approved = true
	// -> PutState
	// @ ./scheema.go
	// Key: prefixInventory + []string{ input.UUIDInventory }
	// Value: type Inventory struct {
	//   Broker   string  `json:"broker"`
	//   Proposal string  `json:"proposal"`
	//   Price    float64 `json:"price"`
	//   UUID     string  `json:"UUID"`
	//   IsSold   bool    `json:"is-sold"`
	// }
	// ! default #Inventory IsSold = false
	// ! business logic for applying our artist and brokers agreement to sell
	// => PutState
	// @ ./scheema.go
	// Key: prefixBroker + []string{ input.UUID }
	// ! Inherits from #BrokerProposal
	// Value: #Broker
	// ! broker.inventory = append(broker.Inventory, inventory.UUID)
	// != Output
	// @ ./scheema.
	// Response("Brokerage Proposal Accepted")
	"approve_brokerage_request": approveBrokerageRequest,

	// ~ List Brokerage Inventory
	// @ ./broker.go
	// ! List the inventory of a brokerage
	// input json {
	//   Broker string `json:"broker"`
	// }
	// != Output
	// -> GetState
	// output grpc {
	//  [] -> GetState
	//     output type ResponseItem struct {
	//	    Broker   string
	//	    Price    float64
	//	    UUID     string
	//	    Proposal BrokerProposal
	//     }
	// }
	"list_broker_inventory": queryBrokerageInventory,

	// ~ Sell Art
	// transfer ownership of asset to owner
	// @ ./broker.go
	// input json {
	//	Owner     string `json:"owner"`
	//  Inventory string `json:"inventory"`
	// }
	// -> PutState
	// @ ./scheema.go
	// Key: inventoryKey
	// Value: #Inventory
	// ! inventory.IsSold = true
	// -> PutState
	// @ ./scheem.go
	// Key: prefixOwner, []string{ input.Owner }
	// Value: type Owner struct {
	//	Name       string   `json:"name"`
	//  Username   string   `json:"username"`
	//  Password   string   `json:"password"`
	//  Collection []string `json:"collection"
	// }
	// ! Owner.Collection = append(owner.Collection, #Inventory.UUID)
	// != Output
	// @ ./sheema > Response
	// ! Art has been sold by to
	"sell_art": sellArt,

	"create_user": createUser,
}

func (c *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (c *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	calderaFunction := calderaFunctions[function]
	if calderaFunction == nil {
		return shim.Error("Invalid Function")
	}
	return calderaFunction(stub, args)
}

func main() {

	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Chaincode: %s", err)
	}
}
