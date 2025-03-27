export const mock = {
    getDeployments: async () => {
        return [
            {
                id: 1,
                name: "Deployment 1",
                status: "success",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"
            }, 
            {
                id: 2,
                name: "Deployment 2",
                status: "failed",
                createdAt: "2021-01-01",
                updatedAt: "2021-01-01"
            }
        ]
    }
}