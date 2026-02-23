module.exports = {
  apps: [
    {
      name: "glitter-tattoo",
      script: "node_modules/serve/build/main.js",
      args: "-s out -p 3004",
      instances: "max", // Use max CPU cores for cluster mode (zero downtime reload capability)
      exec_mode: "cluster", // Run in cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
