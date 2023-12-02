const { exec } = require("child_process");

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

class video_tools {
  compatible_video_types = ["mp4"];

  // user data
  job_data = {
    export_video_type: "",
    original_videos: [],
    export_video_title: "",
  };

  set_job_data(job_data) {
    if (job_data.export_video_type)
      this.job_data.export_video_type = job_data.export_video_type;
    if (job_data.original_videos)
      this.job_data.original_videos = job_data.original_videos;
    if (job_data.export_video_title)
      this.job_data.export_video_title = job_data.export_video_title;
  }

  get() {}

  combine_video_files() {
    return new Promise(async (resolve, reject) => {
      try {
        this.validate_job_data("combine_video_files").then(async () => {
          const ORIGINAL_TITLE_STRING =
            await this.convert_job_titles_to_string();
          const VIDEO_STREAM_FILTERS = await this.create_stream_filters();
          const CONCAT_LENGTH = this.job_data.original_videos.length;
          const COMMAND = `ffmpeg ${ORIGINAL_TITLE_STRING.data} -filter_complex "${VIDEO_STREAM_FILTERS.data} concat=n=${CONCAT_LENGTH}:v=1:a=1 [v] [a]" -map "[v]" -map "[a]"  ${this.job_data.export_video_title}.${this.job_data.export_video_type}`;
          exec(COMMAND, (error, stdout, stderr) => {
            if (error) {
              reject(response.error(error));
            }
            if (stderr) {
              console.log(stderr);
              resolve(response.success(stderr));
            }
            if (stdout) {
              console.log(stdout);
              resolve(response.success("Videos finished combining"));
            }
          });
        });
      } catch (error) {
        reject(response.error(error.message));
      }
    });
  }

  //   ffmpeg -i opening.mkv -i episode.mkv -i ending.mkv \ -filter_complex "[0:v] [0:a] [1:v] [1:a] [2:v] [2:a] concat=n=2:v=1:a=1 [v] [a]" -map "[v]" -map "[a]" output.mkv
  create_stream_filters() {
    var class_data = this;
    return new Promise(async (resolve, reject) => {
      let filters = ``;
      class_data.job_data.original_videos.forEach((title, id) => {
        filters = `${filters} [${id}:v] [${id}:a]`;
        if (id === class_data.job_data.original_videos.length - 1)
          resolve(response.success("", filters));
      });
    });
  }

  convert_job_titles_to_string() {
    var class_data = this;
    return new Promise(async (resolve, reject) => {
      try {
        class_data
          .validate_job_data("convert_job_titles_to_string")
          .then(() => {
            let title_string = "";
            class_data.job_data.original_videos.forEach((title, id) => {
              if (typeof title === "string") {
                title_string = `${title_string} -i "${title}"`;
              } else {
                reject(
                  class_data.error(
                    "Incorrect video title type, expecting string"
                  )
                );
              }
              if (id === class_data.job_data.original_videos.length - 1)
                resolve(response.success("", title_string));
            });
          });
      } catch (error) {
        reject(response.error(error.message));
      }
    });
  }

  validate_job_data(job_type) {
    return new Promise(async (resolve, reject) => {
      // job requirements
      const REQUIREMENTS = {
        combine_video_files: {
          meet_requirements: 0,
          total: 3,
        },
        convert_job_titles_to_string: {
          meet_requirements: 0,
          total: 1,
        },
      };

      // check requirements
      const IS_VALID_EXPORT_TYPE = this.compatible_video_types.includes(
        this.job_data.export_video_type
      );
      const IS_VALID_VIDEO_TITLE =
        typeof this.job_data.export_video_title === "string" ? true : false;

      const IS_ORIGINAL_VIDEOS_CORRECT_TYPE = Array.isArray(
        this.job_data.original_videos
      )
        ? true
        : false;

      // assemble requirements
      if (IS_VALID_EXPORT_TYPE) {
        REQUIREMENTS.combine_video_files.meet_requirements++;
      }
      if (IS_VALID_VIDEO_TITLE) {
        REQUIREMENTS.combine_video_files.meet_requirements++;
        REQUIREMENTS.convert_job_titles_to_string.meet_requirements++;
      }
      if (IS_ORIGINAL_VIDEOS_CORRECT_TYPE) {
        REQUIREMENTS.combine_video_files.meet_requirements++;
      }

      // respond with validation
      switch (job_type) {
        case "combine_video_files":
          if (
            REQUIREMENTS.combine_video_files.meet_requirements ===
            REQUIREMENTS.combine_video_files.total
          ) {
            resolve(response.success());
          }
        case "convert_job_titles_to_string":
          if (
            REQUIREMENTS.convert_job_titles_to_string.meet_requirements ===
            REQUIREMENTS.convert_job_titles_to_string.total
          ) {
            resolve(response.success());
          }
        default:
          reject(response.error("Job configs incorrect"));
          break;
      }
    });
  }
}

module.exports = video_tools;
