module.exports = {
  apps: [
    {
      name: "flow-notes-backend",
      script: "./dist/index.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "300M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm",
    },
  ],
};
