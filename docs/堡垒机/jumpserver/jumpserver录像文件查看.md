# jumpserver录像文件查看



## 录像文件存放位置

jumpserver的录像文件存放位置默认是 `/data/jumpserver/core/data/media/replay`

以时间目录区分且是以 `cast` 格式存储的，是 [asciinema](https://docs.asciinema.org/manual/asciicast/v2/) 的录制文件

![iShot_2025-08-20_19.06.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-20_19.06.06.png)







使用 `asciinema` 命令可以播放 `cast` 格式的文件

```shell
asciinema play 1e79be60-248d-46b5-a6bc-572a2d348b47.cast
```

