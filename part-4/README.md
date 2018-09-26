# Part 4: Decentralization

## Decentralization questions

1. Running containers on native hosts can be impractical due the nuances of server hosting.  containers require continuous up-time, load-balancing, dedicated security infastructure and may require specialized maintenance. Selecting a Blockchain as a service product to overcome these nuances is highly prefered, so that high uptime nodes never fail and bring the network to a place where the endoresement policy cannot be fulfilled, where a fabric networks integrity comes into question because one node wasn't properly secured, or when a network needs a seemless chaincode or version update.

2. Using a clustering tool for docker containers such as docker swarm or kubernetes is a great way to establish and manage a cluster of docker containers as a single virtual system.  Multi-tenancy in Kubernetes offers a great way to build under a single kubernetes cluster while satisfying security concerns.

Docker swarm is a mode in docker that enables cluster management and orchestration features.    Given a manager or worker permission, an individual can CRUD services inside the network.  Swarm also has ingress load balancing to manage requests amoung services

Kubernetes is an open-source system for automating deployment, scaling and management of containerized applications.  In many senses it provides the same functionality of Docker swarm and can even be used in conjunction with swarm, though kubernetes is considered a more extensive solution.  As a more extensive solution, kubernetes sports the need for greater configuration than swarm.

In terms of performance kubernetes focuses on string cluster state guarantees, while swarm focuses on quick deployment.

Sources:
https://medium.com/@wahabjawed/hyperledger-fabric-on-multiple-hosts-a33b08ef24f
https://github.com/ChoiSD/hyperledger_on_swarm
https://hackernoon.com/how-to-deploy-hyperledger-fabric-on-kubernetes-1-a2ceb3ada078
https://opensource.com/article/18/4/deploying-hyperledger-fabric-kubernetes
https://github.com/IBM/blockchain-network-on-kubernetes

3. IBM cloud has a blockchain platform and a kubernetes api to bring fabric networks to the cloud.  The blockchain platform has functions for development, governance and operations, and abstracts configuration into simple foundational network services. the IBM cloud kubernetes services combines docker and kubernetes to deliver powerful tools to automate deployment, operation, scaling and monitoring of the fabric network.  This solution seems tightly intergrated with composer.


4. Hyperledger cello is a utility in incubation within the hyperledger projects hosted by the linux foundation.  the utility aims to bring 'as-a-service' deployment model to the blockchain econosystem.  Cello sports tools to manage the lifecycle of blockchians, currently fabric.

## Kubernetes Deployment
Within the kubernetes folder one will find a deployment spec for our network
one will need ibmcloud stuff, for information on how to run, see ibm/blockchain-network-on-kubernetes



