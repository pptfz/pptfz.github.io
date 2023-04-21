[toc]



# mysql字符集

## 1.字符集定义

<h4>字符集(charset)：是一个系统支持的所有抽象字符的集合。字符是各种文字和符号的总称， 包括各国家文字、标点符号、图形符号、数字等</h4>



## 2.mysql数据库的字符集

<h4>1.字符集 charset </h4>

<h4>2.校对规则 collation</h4>



## 3.mysql中常见的字符集

<h3>ASCII字符集</h3>

- **1.一共128个字符，包括空格、标点符号、数字、大小写字母和一些不可见字符**
- **2.每个字符使用一个字节编码--一个字节是8位，一共有256个编码方式足以承担128个**

<h3>ISO 8859-1字符集-latin1</h3>

- **1.一共256个字符，足以用一个字节标识。**
- **2.共收录256个字符，是在ASCII字符集的基础上又扩充了128个西欧常用字符**

<h3>GB2312字符集</h3>

- **1.收录了汉字以及拉丁字母、希腊字母、日文平假名及片假名字母、俄语西里尔字母**
- **2.同时这种字符集又兼容ASCII字符集**
- **3.如果该字符在ASCII字符集中，则采用1字节编码。否则采用2字节编码。**
- **4.类似这种一个字符需要的字节数不同称为边长编码**

<h3>GBK字符集</h3>

- **GBK字符集只是在收录字符范围上对GB2312字符集作了扩充，编码方式上兼容GB2312**

<h3>utf8字符集</h3>

- **1.收录地球上能想到的所有字符，而且还在不断扩充。这种字符集兼容ASCII字符集，采用变长编码方式，编码一个字符需要使用1～4个字节**

- **2.兼容ASCII**

- **3.utf8只是Unicode字符集的一种编码方案，Unicode字符集可以采用utf8、utf16、utf32这几种编码方案，utf8使用1～4个字节编码一个字符，utf16使用2个或4个字节编码一个字符，utf32使用4个字节编码一个字符。**



## 4.mysql常见校对规则

**1.ci：大小写不敏感**

**2.cs或bin：大小写敏感**

**示例**

```mysql
create database DB1 charset utf8 collate=utf8_general_ci
```



## 5.查看字符集和校对规则

**查看字符集(mysql5.7)**

```mysql
mysql> show charset;
+----------+---------------------------------+---------------------+--------+
| Charset  | Description                     | Default collation   | Maxlen |
+----------+---------------------------------+---------------------+--------+
| big5     | Big5 Traditional Chinese        | big5_chinese_ci     |      2 |
| dec8     | DEC West European               | dec8_swedish_ci     |      1 |
| cp850    | DOS West European               | cp850_general_ci    |      1 |
| hp8      | HP West European                | hp8_english_ci      |      1 |
| koi8r    | KOI8-R Relcom Russian           | koi8r_general_ci    |      1 |
| latin1   | cp1252 West European            | latin1_swedish_ci   |      1 |
| latin2   | ISO 8859-2 Central European     | latin2_general_ci   |      1 |
| swe7     | 7bit Swedish                    | swe7_swedish_ci     |      1 |
| ascii    | US ASCII                        | ascii_general_ci    |      1 |
| ujis     | EUC-JP Japanese                 | ujis_japanese_ci    |      3 |
| sjis     | Shift-JIS Japanese              | sjis_japanese_ci    |      2 |
| hebrew   | ISO 8859-8 Hebrew               | hebrew_general_ci   |      1 |
| tis620   | TIS620 Thai                     | tis620_thai_ci      |      1 |
| euckr    | EUC-KR Korean                   | euckr_korean_ci     |      2 |
| koi8u    | KOI8-U Ukrainian                | koi8u_general_ci    |      1 |
| gb2312   | GB2312 Simplified Chinese       | gb2312_chinese_ci   |      2 |
| greek    | ISO 8859-7 Greek                | greek_general_ci    |      1 |
| cp1250   | Windows Central European        | cp1250_general_ci   |      1 |
| gbk      | GBK Simplified Chinese          | gbk_chinese_ci      |      2 |
| latin5   | ISO 8859-9 Turkish              | latin5_turkish_ci   |      1 |
| armscii8 | ARMSCII-8 Armenian              | armscii8_general_ci |      1 |
| utf8     | UTF-8 Unicode                   | utf8_general_ci     |      3 |
| ucs2     | UCS-2 Unicode                   | ucs2_general_ci     |      2 |
| cp866    | DOS Russian                     | cp866_general_ci    |      1 |
| keybcs2  | DOS Kamenicky Czech-Slovak      | keybcs2_general_ci  |      1 |
| macce    | Mac Central European            | macce_general_ci    |      1 |
| macroman | Mac West European               | macroman_general_ci |      1 |
| cp852    | DOS Central European            | cp852_general_ci    |      1 |
| latin7   | ISO 8859-13 Baltic              | latin7_general_ci   |      1 |
| utf8mb4  | UTF-8 Unicode                   | utf8mb4_general_ci  |      4 |
| cp1251   | Windows Cyrillic                | cp1251_general_ci   |      1 |
| utf16    | UTF-16 Unicode                  | utf16_general_ci    |      4 |
| utf16le  | UTF-16LE Unicode                | utf16le_general_ci  |      4 |
| cp1256   | Windows Arabic                  | cp1256_general_ci   |      1 |
| cp1257   | Windows Baltic                  | cp1257_general_ci   |      1 |
| utf32    | UTF-32 Unicode                  | utf32_general_ci    |      4 |
| binary   | Binary pseudo charset           | binary              |      1 |
| geostd8  | GEOSTD8 Georgian                | geostd8_general_ci  |      1 |
| cp932    | SJIS for Windows Japanese       | cp932_japanese_ci   |      2 |
| eucjpms  | UJIS for Windows Japanese       | eucjpms_japanese_ci |      3 |
| gb18030  | China National Standard GB18030 | gb18030_chinese_ci  |      4 |
+----------+---------------------------------+---------------------+--------+
41 rows in set (0.00 sec)
```



**查看校对规则**

```mysql
mysql> show collation;
+--------------------------+----------+-----+---------+----------+---------+
| Collation                | Charset  | Id  | Default | Compiled | Sortlen |
+--------------------------+----------+-----+---------+----------+---------+
| big5_chinese_ci          | big5     |   1 | Yes     | Yes      |       1 |
| big5_bin                 | big5     |  84 |         | Yes      |       1 |
| dec8_swedish_ci          | dec8     |   3 | Yes     | Yes      |       1 |
| dec8_bin                 | dec8     |  69 |         | Yes      |       1 |
| cp850_general_ci         | cp850    |   4 | Yes     | Yes      |       1 |
| cp850_bin                | cp850    |  80 |         | Yes      |       1 |
| hp8_english_ci           | hp8      |   6 | Yes     | Yes      |       1 |
| hp8_bin                  | hp8      |  72 |         | Yes      |       1 |
| koi8r_general_ci         | koi8r    |   7 | Yes     | Yes      |       1 |
| koi8r_bin                | koi8r    |  74 |         | Yes      |       1 |
| latin1_german1_ci        | latin1   |   5 |         | Yes      |       1 |
| latin1_swedish_ci        | latin1   |   8 | Yes     | Yes      |       1 |
| latin1_danish_ci         | latin1   |  15 |         | Yes      |       1 |
| latin1_german2_ci        | latin1   |  31 |         | Yes      |       2 |
| latin1_bin               | latin1   |  47 |         | Yes      |       1 |
| latin1_general_ci        | latin1   |  48 |         | Yes      |       1 |
| latin1_general_cs        | latin1   |  49 |         | Yes      |       1 |
| latin1_spanish_ci        | latin1   |  94 |         | Yes      |       1 |
| latin2_czech_cs          | latin2   |   2 |         | Yes      |       4 |
| latin2_general_ci        | latin2   |   9 | Yes     | Yes      |       1 |
| latin2_hungarian_ci      | latin2   |  21 |         | Yes      |       1 |
| latin2_croatian_ci       | latin2   |  27 |         | Yes      |       1 |
| latin2_bin               | latin2   |  77 |         | Yes      |       1 |
| swe7_swedish_ci          | swe7     |  10 | Yes     | Yes      |       1 |
| swe7_bin                 | swe7     |  82 |         | Yes      |       1 |
| ascii_general_ci         | ascii    |  11 | Yes     | Yes      |       1 |
| ascii_bin                | ascii    |  65 |         | Yes      |       1 |
| ujis_japanese_ci         | ujis     |  12 | Yes     | Yes      |       1 |
| ujis_bin                 | ujis     |  91 |         | Yes      |       1 |
| sjis_japanese_ci         | sjis     |  13 | Yes     | Yes      |       1 |
| sjis_bin                 | sjis     |  88 |         | Yes      |       1 |
| hebrew_general_ci        | hebrew   |  16 | Yes     | Yes      |       1 |
| hebrew_bin               | hebrew   |  71 |         | Yes      |       1 |
| tis620_thai_ci           | tis620   |  18 | Yes     | Yes      |       4 |
| tis620_bin               | tis620   |  89 |         | Yes      |       1 |
| euckr_korean_ci          | euckr    |  19 | Yes     | Yes      |       1 |
| euckr_bin                | euckr    |  85 |         | Yes      |       1 |
| koi8u_general_ci         | koi8u    |  22 | Yes     | Yes      |       1 |
| koi8u_bin                | koi8u    |  75 |         | Yes      |       1 |
| gb2312_chinese_ci        | gb2312   |  24 | Yes     | Yes      |       1 |
| gb2312_bin               | gb2312   |  86 |         | Yes      |       1 |
| greek_general_ci         | greek    |  25 | Yes     | Yes      |       1 |
| greek_bin                | greek    |  70 |         | Yes      |       1 |
| cp1250_general_ci        | cp1250   |  26 | Yes     | Yes      |       1 |
| cp1250_czech_cs          | cp1250   |  34 |         | Yes      |       2 |
| cp1250_croatian_ci       | cp1250   |  44 |         | Yes      |       1 |
| cp1250_bin               | cp1250   |  66 |         | Yes      |       1 |
| cp1250_polish_ci         | cp1250   |  99 |         | Yes      |       1 |
| gbk_chinese_ci           | gbk      |  28 | Yes     | Yes      |       1 |
| gbk_bin                  | gbk      |  87 |         | Yes      |       1 |
| latin5_turkish_ci        | latin5   |  30 | Yes     | Yes      |       1 |
| latin5_bin               | latin5   |  78 |         | Yes      |       1 |
| armscii8_general_ci      | armscii8 |  32 | Yes     | Yes      |       1 |
| armscii8_bin             | armscii8 |  64 |         | Yes      |       1 |
| utf8_general_ci          | utf8     |  33 | Yes     | Yes      |       1 |
| utf8_bin                 | utf8     |  83 |         | Yes      |       1 |
| utf8_unicode_ci          | utf8     | 192 |         | Yes      |       8 |
| utf8_icelandic_ci        | utf8     | 193 |         | Yes      |       8 |
| utf8_latvian_ci          | utf8     | 194 |         | Yes      |       8 |
| utf8_romanian_ci         | utf8     | 195 |         | Yes      |       8 |
| utf8_slovenian_ci        | utf8     | 196 |         | Yes      |       8 |
| utf8_polish_ci           | utf8     | 197 |         | Yes      |       8 |
| utf8_estonian_ci         | utf8     | 198 |         | Yes      |       8 |
| utf8_spanish_ci          | utf8     | 199 |         | Yes      |       8 |
| utf8_swedish_ci          | utf8     | 200 |         | Yes      |       8 |
| utf8_turkish_ci          | utf8     | 201 |         | Yes      |       8 |
| utf8_czech_ci            | utf8     | 202 |         | Yes      |       8 |
| utf8_danish_ci           | utf8     | 203 |         | Yes      |       8 |
| utf8_lithuanian_ci       | utf8     | 204 |         | Yes      |       8 |
| utf8_slovak_ci           | utf8     | 205 |         | Yes      |       8 |
| utf8_spanish2_ci         | utf8     | 206 |         | Yes      |       8 |
| utf8_roman_ci            | utf8     | 207 |         | Yes      |       8 |
| utf8_persian_ci          | utf8     | 208 |         | Yes      |       8 |
| utf8_esperanto_ci        | utf8     | 209 |         | Yes      |       8 |
| utf8_hungarian_ci        | utf8     | 210 |         | Yes      |       8 |
| utf8_sinhala_ci          | utf8     | 211 |         | Yes      |       8 |
| utf8_german2_ci          | utf8     | 212 |         | Yes      |       8 |
| utf8_croatian_ci         | utf8     | 213 |         | Yes      |       8 |
| utf8_unicode_520_ci      | utf8     | 214 |         | Yes      |       8 |
| utf8_vietnamese_ci       | utf8     | 215 |         | Yes      |       8 |
| utf8_general_mysql500_ci | utf8     | 223 |         | Yes      |       1 |
| ucs2_general_ci          | ucs2     |  35 | Yes     | Yes      |       1 |
| ucs2_bin                 | ucs2     |  90 |         | Yes      |       1 |
| ucs2_unicode_ci          | ucs2     | 128 |         | Yes      |       8 |
| ucs2_icelandic_ci        | ucs2     | 129 |         | Yes      |       8 |
| ucs2_latvian_ci          | ucs2     | 130 |         | Yes      |       8 |
| ucs2_romanian_ci         | ucs2     | 131 |         | Yes      |       8 |
| ucs2_slovenian_ci        | ucs2     | 132 |         | Yes      |       8 |
| ucs2_polish_ci           | ucs2     | 133 |         | Yes      |       8 |
| ucs2_estonian_ci         | ucs2     | 134 |         | Yes      |       8 |
| ucs2_spanish_ci          | ucs2     | 135 |         | Yes      |       8 |
| ucs2_swedish_ci          | ucs2     | 136 |         | Yes      |       8 |
| ucs2_turkish_ci          | ucs2     | 137 |         | Yes      |       8 |
| ucs2_czech_ci            | ucs2     | 138 |         | Yes      |       8 |
| ucs2_danish_ci           | ucs2     | 139 |         | Yes      |       8 |
| ucs2_lithuanian_ci       | ucs2     | 140 |         | Yes      |       8 |
| ucs2_slovak_ci           | ucs2     | 141 |         | Yes      |       8 |
| ucs2_spanish2_ci         | ucs2     | 142 |         | Yes      |       8 |
| ucs2_roman_ci            | ucs2     | 143 |         | Yes      |       8 |
| ucs2_persian_ci          | ucs2     | 144 |         | Yes      |       8 |
| ucs2_esperanto_ci        | ucs2     | 145 |         | Yes      |       8 |
| ucs2_hungarian_ci        | ucs2     | 146 |         | Yes      |       8 |
| ucs2_sinhala_ci          | ucs2     | 147 |         | Yes      |       8 |
| ucs2_german2_ci          | ucs2     | 148 |         | Yes      |       8 |
| ucs2_croatian_ci         | ucs2     | 149 |         | Yes      |       8 |
| ucs2_unicode_520_ci      | ucs2     | 150 |         | Yes      |       8 |
| ucs2_vietnamese_ci       | ucs2     | 151 |         | Yes      |       8 |
| ucs2_general_mysql500_ci | ucs2     | 159 |         | Yes      |       1 |
| cp866_general_ci         | cp866    |  36 | Yes     | Yes      |       1 |
| cp866_bin                | cp866    |  68 |         | Yes      |       1 |
| keybcs2_general_ci       | keybcs2  |  37 | Yes     | Yes      |       1 |
| keybcs2_bin              | keybcs2  |  73 |         | Yes      |       1 |
| macce_general_ci         | macce    |  38 | Yes     | Yes      |       1 |
| macce_bin                | macce    |  43 |         | Yes      |       1 |
| macroman_general_ci      | macroman |  39 | Yes     | Yes      |       1 |
| macroman_bin             | macroman |  53 |         | Yes      |       1 |
| cp852_general_ci         | cp852    |  40 | Yes     | Yes      |       1 |
| cp852_bin                | cp852    |  81 |         | Yes      |       1 |
| latin7_estonian_cs       | latin7   |  20 |         | Yes      |       1 |
| latin7_general_ci        | latin7   |  41 | Yes     | Yes      |       1 |
| latin7_general_cs        | latin7   |  42 |         | Yes      |       1 |
| latin7_bin               | latin7   |  79 |         | Yes      |       1 |
| utf8mb4_general_ci       | utf8mb4  |  45 | Yes     | Yes      |       1 |
| utf8mb4_bin              | utf8mb4  |  46 |         | Yes      |       1 |
| utf8mb4_unicode_ci       | utf8mb4  | 224 |         | Yes      |       8 |
| utf8mb4_icelandic_ci     | utf8mb4  | 225 |         | Yes      |       8 |
| utf8mb4_latvian_ci       | utf8mb4  | 226 |         | Yes      |       8 |
| utf8mb4_romanian_ci      | utf8mb4  | 227 |         | Yes      |       8 |
| utf8mb4_slovenian_ci     | utf8mb4  | 228 |         | Yes      |       8 |
| utf8mb4_polish_ci        | utf8mb4  | 229 |         | Yes      |       8 |
| utf8mb4_estonian_ci      | utf8mb4  | 230 |         | Yes      |       8 |
| utf8mb4_spanish_ci       | utf8mb4  | 231 |         | Yes      |       8 |
| utf8mb4_swedish_ci       | utf8mb4  | 232 |         | Yes      |       8 |
| utf8mb4_turkish_ci       | utf8mb4  | 233 |         | Yes      |       8 |
| utf8mb4_czech_ci         | utf8mb4  | 234 |         | Yes      |       8 |
| utf8mb4_danish_ci        | utf8mb4  | 235 |         | Yes      |       8 |
| utf8mb4_lithuanian_ci    | utf8mb4  | 236 |         | Yes      |       8 |
| utf8mb4_slovak_ci        | utf8mb4  | 237 |         | Yes      |       8 |
| utf8mb4_spanish2_ci      | utf8mb4  | 238 |         | Yes      |       8 |
| utf8mb4_roman_ci         | utf8mb4  | 239 |         | Yes      |       8 |
| utf8mb4_persian_ci       | utf8mb4  | 240 |         | Yes      |       8 |
| utf8mb4_esperanto_ci     | utf8mb4  | 241 |         | Yes      |       8 |
| utf8mb4_hungarian_ci     | utf8mb4  | 242 |         | Yes      |       8 |
| utf8mb4_sinhala_ci       | utf8mb4  | 243 |         | Yes      |       8 |
| utf8mb4_german2_ci       | utf8mb4  | 244 |         | Yes      |       8 |
| utf8mb4_croatian_ci      | utf8mb4  | 245 |         | Yes      |       8 |
| utf8mb4_unicode_520_ci   | utf8mb4  | 246 |         | Yes      |       8 |
| utf8mb4_vietnamese_ci    | utf8mb4  | 247 |         | Yes      |       8 |
| cp1251_bulgarian_ci      | cp1251   |  14 |         | Yes      |       1 |
| cp1251_ukrainian_ci      | cp1251   |  23 |         | Yes      |       1 |
| cp1251_bin               | cp1251   |  50 |         | Yes      |       1 |
| cp1251_general_ci        | cp1251   |  51 | Yes     | Yes      |       1 |
| cp1251_general_cs        | cp1251   |  52 |         | Yes      |       1 |
| utf16_general_ci         | utf16    |  54 | Yes     | Yes      |       1 |
| utf16_bin                | utf16    |  55 |         | Yes      |       1 |
| utf16_unicode_ci         | utf16    | 101 |         | Yes      |       8 |
| utf16_icelandic_ci       | utf16    | 102 |         | Yes      |       8 |
| utf16_latvian_ci         | utf16    | 103 |         | Yes      |       8 |
| utf16_romanian_ci        | utf16    | 104 |         | Yes      |       8 |
| utf16_slovenian_ci       | utf16    | 105 |         | Yes      |       8 |
| utf16_polish_ci          | utf16    | 106 |         | Yes      |       8 |
| utf16_estonian_ci        | utf16    | 107 |         | Yes      |       8 |
| utf16_spanish_ci         | utf16    | 108 |         | Yes      |       8 |
| utf16_swedish_ci         | utf16    | 109 |         | Yes      |       8 |
| utf16_turkish_ci         | utf16    | 110 |         | Yes      |       8 |
| utf16_czech_ci           | utf16    | 111 |         | Yes      |       8 |
| utf16_danish_ci          | utf16    | 112 |         | Yes      |       8 |
| utf16_lithuanian_ci      | utf16    | 113 |         | Yes      |       8 |
| utf16_slovak_ci          | utf16    | 114 |         | Yes      |       8 |
| utf16_spanish2_ci        | utf16    | 115 |         | Yes      |       8 |
| utf16_roman_ci           | utf16    | 116 |         | Yes      |       8 |
| utf16_persian_ci         | utf16    | 117 |         | Yes      |       8 |
| utf16_esperanto_ci       | utf16    | 118 |         | Yes      |       8 |
| utf16_hungarian_ci       | utf16    | 119 |         | Yes      |       8 |
| utf16_sinhala_ci         | utf16    | 120 |         | Yes      |       8 |
| utf16_german2_ci         | utf16    | 121 |         | Yes      |       8 |
| utf16_croatian_ci        | utf16    | 122 |         | Yes      |       8 |
| utf16_unicode_520_ci     | utf16    | 123 |         | Yes      |       8 |
| utf16_vietnamese_ci      | utf16    | 124 |         | Yes      |       8 |
| utf16le_general_ci       | utf16le  |  56 | Yes     | Yes      |       1 |
| utf16le_bin              | utf16le  |  62 |         | Yes      |       1 |
| cp1256_general_ci        | cp1256   |  57 | Yes     | Yes      |       1 |
| cp1256_bin               | cp1256   |  67 |         | Yes      |       1 |
| cp1257_lithuanian_ci     | cp1257   |  29 |         | Yes      |       1 |
| cp1257_bin               | cp1257   |  58 |         | Yes      |       1 |
| cp1257_general_ci        | cp1257   |  59 | Yes     | Yes      |       1 |
| utf32_general_ci         | utf32    |  60 | Yes     | Yes      |       1 |
| utf32_bin                | utf32    |  61 |         | Yes      |       1 |
| utf32_unicode_ci         | utf32    | 160 |         | Yes      |       8 |
| utf32_icelandic_ci       | utf32    | 161 |         | Yes      |       8 |
| utf32_latvian_ci         | utf32    | 162 |         | Yes      |       8 |
| utf32_romanian_ci        | utf32    | 163 |         | Yes      |       8 |
| utf32_slovenian_ci       | utf32    | 164 |         | Yes      |       8 |
| utf32_polish_ci          | utf32    | 165 |         | Yes      |       8 |
| utf32_estonian_ci        | utf32    | 166 |         | Yes      |       8 |
| utf32_spanish_ci         | utf32    | 167 |         | Yes      |       8 |
| utf32_swedish_ci         | utf32    | 168 |         | Yes      |       8 |
| utf32_turkish_ci         | utf32    | 169 |         | Yes      |       8 |
| utf32_czech_ci           | utf32    | 170 |         | Yes      |       8 |
| utf32_danish_ci          | utf32    | 171 |         | Yes      |       8 |
| utf32_lithuanian_ci      | utf32    | 172 |         | Yes      |       8 |
| utf32_slovak_ci          | utf32    | 173 |         | Yes      |       8 |
| utf32_spanish2_ci        | utf32    | 174 |         | Yes      |       8 |
| utf32_roman_ci           | utf32    | 175 |         | Yes      |       8 |
| utf32_persian_ci         | utf32    | 176 |         | Yes      |       8 |
| utf32_esperanto_ci       | utf32    | 177 |         | Yes      |       8 |
| utf32_hungarian_ci       | utf32    | 178 |         | Yes      |       8 |
| utf32_sinhala_ci         | utf32    | 179 |         | Yes      |       8 |
| utf32_german2_ci         | utf32    | 180 |         | Yes      |       8 |
| utf32_croatian_ci        | utf32    | 181 |         | Yes      |       8 |
| utf32_unicode_520_ci     | utf32    | 182 |         | Yes      |       8 |
| utf32_vietnamese_ci      | utf32    | 183 |         | Yes      |       8 |
| binary                   | binary   |  63 | Yes     | Yes      |       1 |
| geostd8_general_ci       | geostd8  |  92 | Yes     | Yes      |       1 |
| geostd8_bin              | geostd8  |  93 |         | Yes      |       1 |
| cp932_japanese_ci        | cp932    |  95 | Yes     | Yes      |       1 |
| cp932_bin                | cp932    |  96 |         | Yes      |       1 |
| eucjpms_japanese_ci      | eucjpms  |  97 | Yes     | Yes      |       1 |
| eucjpms_bin              | eucjpms  |  98 |         | Yes      |       1 |
| gb18030_chinese_ci       | gb18030  | 248 | Yes     | Yes      |       2 |
| gb18030_bin              | gb18030  | 249 |         | Yes      |       1 |
| gb18030_unicode_520_ci   | gb18030  | 250 |         | Yes      |       8 |
+--------------------------+----------+-----+---------+----------+---------+
222 rows in set (0.01 sec)
```



## 6.字符集设置

**mysql有4个级别的字符集**

> **1.服务器级别(操作系统级别)**
>
> **2.数据库级别**
>
> **3.表级别**
>
> **4.列级别**



### 6.1 服务器级别

```mysql
1.操作系统级别
#centOS7
[root@hwyun ~]# cat /etc/locale.conf 
LANG=en_US.UTF-8

#centOS6
[root@test1 ~]# cat /etc/sysconfig/i18n 
LANG="en_US.UTF-8"
SYSFONT="latarcyrheb-sun16"
[root@test1 ~]# echo $LANG
en_US.UTF-8


2.操作系统客户端级别
ssh连接工具设置

3.mysql实例级别
方法1：在编译安装时候就指定如下服务器端字符集。
cmake . 
-DDEFAULT_CHARSET=utf8 \
-DDEFAULT_COLLATION=utf8_general_ci \
-DWITH_EXTRA_CHARSETS=all \

方法2：在配置文件中设置字符集
[mysqld]
character-set-server=utf8
```



### 6.2 数据库级别

```mysql
mysql> create database 数据库名 charset utf8 default collate = utf8_general_ci;
```





### 6.3 表级别

```mysql
mysql>  CREATE TABLE `test` (
`id` int(4) NOT NULL AUTO_INCREMENT,
`name` char(20) NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
```



### 6.4 列级别

**类型为CHAR、VARCHAR、TEXT的列，可以指定字符集/校验规则**

```mysql
create table t1(id int,address char(30) character set utf8);
```



## 7.生产环境更改数据库(含数据)字符集的方法

```mysql
mysql> alter database 数据库名 CHARACTER SET utf8 collate utf8_general_ci;
mysql> alter table t1 CHARACTER SET utf8;
```

