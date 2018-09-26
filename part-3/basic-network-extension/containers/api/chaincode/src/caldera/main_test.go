package main

import (
	"encoding/json"
	_ "fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"testing"
)

func checkInit(t *testing.T, stub *shim.MockStub, args [][]byte) {
	res := stub.MockInit("1", args)
	if res.Status != shim.OK {
		fmt.Println("Init failed", string(res.Message))
		t.FailNow()
	}
}

func checkInvoke(t *testing.T, stub *shim.MockStub, args [][]byte) {
	res := stub.MockInvoke("2", args)
	fmt.Printf("%+v\n", res)

	if res.Status != shim.OK {
		fmt.Println("Invoke failed", string(res.Message))
		t.FailNow()
	}
}

func checkState(t *testing.T, stub *shim.MockStub, name string, value string) {
	bytes := stub.State[name]
	if bytes == nil {
		fmt.Println("state", name, "fail to get value")
		t.FailNow()
	}

	if string(bytes) != value {
		fmt.Println("state value", name, "wasn't expected: ", value)
		t.FailNow()
	}
}

func TestInit(t *testing.T) {
	scc := new(SmartContract)
	stub := shim.NewMockStub("caldera", scc)

	checkInit(t, stub, [][]byte{[]byte("init")})

}

func TestInvoke(t *testing.T) {
	scc := new(SmartContract)
	stub := shim.NewMockStub("caldera", scc)

	checkInvoke(t, stub, [][]byte{[]byte("create_artist"), []byte("{}")})
}
