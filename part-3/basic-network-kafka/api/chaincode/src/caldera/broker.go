package main

import (
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createBroker(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid Arg Count")
	}

	var broker Broker
	err := json.Unmarshal([]byte(args[0]), &broker)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixBroker, []string{broker.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerAsBytes, _ := stub.GetState(key)

	if len(brokerAsBytes) == 0 {
		brokerAsBytes, err = json.Marshal(broker)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(key, brokerAsBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
		response := struct {
			Message string
		}{
			Message: "Registered!",
		}

		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}

		return shim.Success(responseAsBytes)
	} else {
		response := struct {
			Message string
		}{
			Message: "Broker already exists",
		}

		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}
}

func queryBrokerageRequests(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	input := struct {
		Broker string `json:"broker"`
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerKey, err := stub.CreateCompositeKey(prefixBroker, []string{input.Broker})
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerAsBytes, err := stub.GetState(brokerKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(brokerAsBytes) == 0 {
		response := Response{"Broker Doesn't exist"}
		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var broker Broker
	err = json.Unmarshal(brokerAsBytes, &broker)
	if err != nil {
		return shim.Error(err.Error())
	}
	var requests []BrokerProposal
	for _, request := range broker.Requests {
		requestKey, err := stub.CreateCompositeKey(prefixBrokerProposal, []string{request})
		if err != nil {
			return shim.Error(err.Error())
		}
		proposalAsBytes, err := stub.GetState(requestKey)
		if err != nil {
			return shim.Error(err.Error())
		}
		var request BrokerProposal
		err = json.Unmarshal(proposalAsBytes, &request)
		if err != nil {
			return shim.Error(err.Error())
		}

		requests = append(requests, request)
	}

	requestsAsBytes, err := json.Marshal(requests)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(requestsAsBytes)
}

func approveBrokerageRequest(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	input := struct {
		UUID          string `json:"UUID"`
		UUIDInventory string `json:"inventoryUUID"`
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	proposalKey, err := stub.CreateCompositeKey(prefixBrokerProposal, []string{input.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	proposalAsBytes, err := stub.GetState(proposalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(proposalAsBytes) == 0 {
		responseAsBytes, err := json.Marshal(Response{"Proposal Doesn't Exist"})
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var brokerProposal BrokerProposal
	err = json.Unmarshal(proposalAsBytes, &brokerProposal)
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerKey, err := stub.CreateCompositeKey(prefixBroker, []string{brokerProposal.Broker})
	if err != nil {
		return shim.Error(err.Error())
	}
	brokerAsBytes, err := stub.GetState(brokerKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	var broker Broker
	err = json.Unmarshal(brokerAsBytes, &broker)
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerProposal.Reviewed = true
	brokerProposal.Approved = true
	newPrice := brokerProposal.Price * ((1 + brokerProposal.Margin) / brokerProposal.Margin)
	inventory := Inventory{brokerProposal.Broker, brokerProposal.UUID, newPrice, input.UUIDInventory, false}

	proposalAsBytes, err = json.Marshal(brokerProposal)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(proposalKey, proposalAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	inventoryAsBytes, err := json.Marshal(inventory)
	if err != nil {
		return shim.Error(err.Error())
	}

	inventoryKey, err := stub.CreateCompositeKey(prefixInventory, []string{inventory.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(inventoryKey, inventoryAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	broker.Inventory = append(broker.Inventory, inventory.UUID)
	brokerAsBytes, err = json.Marshal(broker)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(brokerKey, brokerAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	responseAsBytes, err := json.Marshal(Response{"Brokerage Proposal Accepted"})
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(responseAsBytes)
}

func queryBrokerageInventory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	type ResponseItem struct {
		Broker   string
		Price    float64
		UUID     string
		Proposal BrokerProposal
	}

	input := struct {
		Broker string `json:"broker"`
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerKey, err := stub.CreateCompositeKey(prefixBroker, []string{input.Broker})
	if err != nil {
		return shim.Error(err.Error())
	}

	brokerAsBytes, err := stub.GetState(brokerKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(brokerAsBytes) == 0 {
		responseAsBytes, err := json.Marshal(Response{"No broker by that user"})
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var broker Broker
	err = json.Unmarshal(brokerAsBytes, &broker)
	if err != nil {
		return shim.Error(err.Error())
	}

	var response []ResponseItem
	for _, UUID := range broker.Inventory {

		inventoryKey, err := stub.CreateCompositeKey(prefixInventory, []string{UUID})
		if err != nil {
			return shim.Error(err.Error())
		}
		inventoryAsBytes, err := stub.GetState(inventoryKey)
		if err != nil {
			return shim.Error(err.Error())
		}
		var inventory Inventory
		err = json.Unmarshal(inventoryAsBytes, &inventory)
		if err != nil {
			return shim.Error(err.Error())
		}

		proposalKey, err := stub.CreateCompositeKey(prefixBrokerProposal, []string{inventory.Proposal})
		if err != nil {
			return shim.Error(err.Error())
		}

		proposalAsBytes, err := stub.GetState(proposalKey)
		if err != nil {
			return shim.Error(err.Error())
		}

		var brokerProposal BrokerProposal
		err = json.Unmarshal(proposalAsBytes, &brokerProposal)
		if err != nil {
			return shim.Error(err.Error())
		}

		responseItem := ResponseItem{inventory.Broker, inventory.Price, inventory.UUID, brokerProposal}
		response = append(response, responseItem)
	}

	responseAsBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseAsBytes)
}

func sellArt(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	input := struct {
		Owner     string `json:"owner"`
		Inventory string `json:"inventory"`
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerKey, err := stub.CreateCompositeKey(prefixOwner, []string{input.Owner})
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerAsBytes, err := stub.GetState(ownerKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(ownerAsBytes) == 0 {
		responseAsBytes, err := json.Marshal(Response{"Owner doesn't exist, please register through an owner node"})
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	inventoryKey, err := stub.CreateCompositeKey(prefixInventory, []string{input.Inventory})
	if err != nil {
		return shim.Error(err.Error())
	}

	inventoryAsBytes, err := stub.GetState(inventoryKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(inventoryAsBytes) == 0 {
		responseAsBytes, err := json.Marshal(Response{"The Piece of art you are looking for isn't here!"})
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var inventory Inventory
	err = json.Unmarshal(inventoryAsBytes, &inventory)
	if err != nil {
		return shim.Error(err.Error())
	}

	proposalKey, err := stub.CreateCompositeKey(prefixBrokerProposal, []string{inventory.Proposal})
	if err != nil {
		return shim.Error(err.Error())
	}

	proposalAsBytes, err := stub.GetState(proposalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	var brokerProposal BrokerProposal
	err = json.Unmarshal(proposalAsBytes, &brokerProposal)
	if err != nil {
		return shim.Error(err.Error())
	}

	var owner Owner
	err = json.Unmarshal(ownerAsBytes, &owner)
	if err != nil {
		return shim.Error(err.Error())
	}

	inventory.IsSold = true
	owner.Collection = append(owner.Collection, inventory.UUID)

	inventoryAsBytes, err = json.Marshal(inventory)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(inventoryKey, inventoryAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	ownerAsBytes, err = json.Marshal(owner)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(ownerKey, ownerAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	responseAsBytes, err := json.Marshal(Response{brokerProposal.Art + " has been sold by " + inventory.Broker + " to " + owner.Name})
	return shim.Success(responseAsBytes)
}
