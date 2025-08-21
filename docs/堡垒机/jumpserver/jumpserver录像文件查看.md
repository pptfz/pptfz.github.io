# jumpserver录像文件查看



## 录像文件存放位置

jumpserver的录像文件存放位置默认是 `/data/jumpserver/core/data/media/replay`

以时间目录区分且是以 `cast` 格式存储的，是 [asciinema](https://docs.asciinema.org/manual/asciicast/v2/) 的录制文件

![iShot_2025-08-20_19.06.06](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-20_19.06.06.png)







使用 `asciinema` 命令可以播放 `cast` 格式的文件

```shell
asciinema play 83f86c11-a9a8-4502-bdae-262f95d0d92b
```



![iShot_2025-08-21_09.56.52](https://raw.githubusercontent.com/pptfz/picgo-images/master/img/iShot_2025-08-21_09.56.52.GIF)
