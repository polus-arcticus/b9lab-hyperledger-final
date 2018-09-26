package main

import (
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createArtist(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	var artist Artist
	err := json.Unmarshal([]byte(args[0]), &artist)
	if err != nil {
		return shim.Error(err.Error())
	}

	key, err := stub.CreateCompositeKey(prefixArtist, []string{artist.Username})
	if err != nil {
		return shim.Error(err.Error())
	}

	artistAsBytes, _ := stub.GetState(key)

	if len(artistAsBytes) == 0 {
		artistAsBytes, err = json.Marshal(artist)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(key, artistAsBytes)
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
			Message: "Artist already exists",
		}

		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}
}

func registerArt(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}

	input := struct {
		Name        string `json:"name"`
		Artist      string `json:"artist"`
		Description string `json:"description"`
	}{}
	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	artistKey, err := stub.CreateCompositeKey(prefixArtist, []string{input.Artist})
	if err != nil {
		return shim.Error(err.Error())
	}

	artistAsBytes, err := stub.GetState(artistKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(artistAsBytes) == 0 {
		response := struct {
			Message string
		}{
			Message: "Artist is not Registered on the network",
		}
		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var artist Artist
	err = json.Unmarshal(artistAsBytes, &artist)
	if err != nil {
		return shim.Error(err.Error())
	}

	artKey, err := stub.CreateCompositeKey(prefixArt, []string{input.Name})
	if err != nil {
		return shim.Error(err.Error())
	}

	artAsBytes, err := stub.GetState(artKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(artAsBytes) != 0 {
		response := struct {
			Message string
		}{
			Message: "art already registered",
		}
		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	artist.Art = append(artist.Art, artKey)
	artistAsBytes, err = json.Marshal(artist)
	if err != nil {
		return shim.Error(err.Error())
	}
	art := Art{input.Name, artist.Name, input.Description}
	artAsBytes, err = json.Marshal(art)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(artKey, artAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(artistKey, artistAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	response := struct {
		Message string
	}{
		Message: "Artwork " + art.Name + " has been Registered",
	}

	responseAsBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(responseAsBytes)
}

func createArtistBrokerProposal(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("invalid arg count")
	}
	input := struct {
		Artist string
		Art    string
		Broker string
		Price  float64
		Margin float64
		UUID   string
	}{}

	err := json.Unmarshal([]byte(args[0]), &input)
	if err != nil {
		return shim.Error(err.Error())
	}

	artistKey, err := stub.CreateCompositeKey(prefixArtist, []string{input.Artist})
	if err != nil {
		return shim.Error(err.Error())
	}

	artistAsBytes, err := stub.GetState(artistKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(artistAsBytes) == 0 {
		response := Response{"artist doesn't exist"}
		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var artist Artist
	err = json.Unmarshal(artistAsBytes, &artist)
	if err != nil {
		return shim.Error(err.Error())
	}

	artKey, err := stub.CreateCompositeKey(prefixArt, []string{input.Art})
	if err != nil {
		return shim.Error(err.Error())
	}

	artAsBytes, err := stub.GetState(artKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(artAsBytes) == 0 {
		response := Response{"art doesn't exist"}
		responseAsBytes, err := json.Marshal(response)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(responseAsBytes)
	}

	var art Art
	err = json.Unmarshal(artAsBytes, &art)
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
		response := Response{"broker doesn't exist"}
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

	proposal := BrokerProposal{artist.Name, art.Name, broker.Username, input.Price, input.Margin, input.UUID, false, false}
	brokerProposalKey, err := stub.CreateCompositeKey(prefixBrokerProposal, []string{input.UUID})
	if err != nil {
		return shim.Error(err.Error())
	}
	proposalAsBytes, err := json.Marshal(proposal)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(brokerProposalKey, proposalAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	broker.Requests = append(broker.Requests, input.UUID)
	brokerAsBytes, err = json.Marshal(broker)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(brokerKey, brokerAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	response := struct {
		Message string
	}{
		Message: "Proposal for " + broker.Name + " to sell " + art.Name + " has been created and sent",
	}

	responseAsBytes, err := json.Marshal(response)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(responseAsBytes)
}
