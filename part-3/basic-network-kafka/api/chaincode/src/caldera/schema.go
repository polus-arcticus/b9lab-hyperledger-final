package main

import (
	_ "encoding/json"
	_ "github.com/hyperledger/fabric/core/chaincode/shim"
)

const prefixArtist = "artist"
const prefixBroker = "broker"
const prefixArt = "art"
const prefixBrokerProposal = "brokerproposal"
const prefixInventory = "inventory"
const prefixOwner = "owner"
const prefixOrg3User = "org3user"

type Response struct {
	Message string
}

type Artist struct {
	Name     string   `json:"name"`
	Username string   `json:"username"`
	Password string   `json:"password"`
	Art      []string `json:"art"`
}

type Broker struct {
	Name      string   `json:"name"`
	Username  string   `json:"username"`
	Password  string   `json:"password"`
	Inventory []string `json:"inventory"`
	Requests  []string `json:"requests"`
}

type Owner struct {
	Name       string   `json:"name"`
	Username   string   `json:"username"`
	Password   string   `json:"password"`
	Collection []string `json:"collection"`
}

type Org3User struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Art struct {
	Name        string `json:"name"`
	Artist      string `json:"artist"`
	Description string `json:"description"`
}

type BrokerProposal struct {
	Artist   string  `json:"artist"`
	Art      string  `json:"art"`
	Broker   string  `json:"broker"`
	Price    float64 `json:"price"`
	Margin   float64 `json:"margin"`
	UUID     string  `json:"UUID"`
	Reviewed bool    `json:"reviewed"`
	Approved bool    `json:"approved"`
}

type Inventory struct {
	Broker   string  `json:"broker"`
	Proposal string  `json:"proposal"`
	Price    float64 `json:"price"`
	UUID     string  `json:"UUID"`
	IsSold   bool    `json:"is-sold"`
}
