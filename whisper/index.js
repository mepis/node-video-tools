const { spawn } = require("child_process");

class response_messages {
  constructor() {}
  error(message) {
    return { success: false, message: message };
  }
  success(message, data) {
    return { success: true, message: message, data: data };
  }
}
var response = new response_messages();

class caption_generator {
  whisper_path = "/config/.local/bin/whisper";

  set_whisper_path(whisper_path) {
    this.whisper_path = whisper_path;
  }

  run_whisper(original_file_path, output_path, model) {
    var whisper_path = this.whisper_path;
    return new Promise(async (resolve, reject) => {
      if (
        model !== "tiny" &&
        model !== "base" &&
        model !== "small" &&
        model !== "large" &&
        model !== "large-v1" &&
        model !== "large-v2"
      )
        reject(response.error("Incorrect model defined"));

      if (model === undefined) model = "small";
      var python_data;
      const python = spawn("python3", [
        whisper_path,
        original_file_path,
        "--output_dir",
        output_path,
        "--model",
        model,
      ]);
      python.stdout.on("data", function (data) {
        console.log(data);
        python_data = data;
      });
      python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log("data: ", python_data);
        resolve(response.success("", python_data));
      });
      try {
      } catch (error) {
        reject(response.error("Error running Whisper"));
      }
    });
  }

  install_whisper() {
    return new Promise(async (resolve, reject) => {
      var python_data;
      const python = spawn("pip", [
        "install",
        "git+https://github.com/openai/whisper.git ",
      ]);
      python.stdout.on("data", function (data) {
        console.log(data);
        python_data = data;
      });
      python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log("data: ", python_data);
        resolve(response.success("", python_data));
      });
      try {
      } catch (error) {
        reject(response.error("Error while install Whisper"));
      }
    });
  }

  check_pip_install() {
    return new Promise(async (resolve, reject) => {
      var python_data;
      const python = spawn("pip", ["--version"]);
      python.stdout.on("data", function (data) {
        console.log(data);
        python_data = data;
      });
      python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log("data: ", python_data);
        resolve(response.success("", python_data));
      });
      try {
      } catch (error) {
        reject(response.error("Pip is not installed ( sudo apt install pip )"));
      }
    });
  }

  check_python_install() {
    return new Promise(async (resolve, reject) => {
      var python_data;
      const python = spawn("python3", ["--version"]);
      python.stdout.on("data", function (data) {
        console.log(data);
        python_data = data;
      });
      python.on("close", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log("data: ", python_data);
        resolve(response.success("", python_data));
      });
      try {
      } catch (error) {
        reject(
          response.error("Python is not installed ( sudo apt install python3 )")
        );
      }
    });
  }
}

module.exports = caption_generator;
