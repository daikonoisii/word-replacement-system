## セットアップ

```
brew install dotnet
```

## コマンド

### windows-32bit

```
dotnet publish -c Release -r win-x86 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:IncludeAllContentForSelfExtract=true \
  -o .
```

### windows-64bit

```
dotnet publish -c Release -r win-x64 \
  --self-contained true \
  -p:PublishSingleFile=true \
  -p:IncludeAllContentForSelfExtract=true \
  -o .
```
