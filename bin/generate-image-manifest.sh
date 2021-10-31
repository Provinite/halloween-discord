#!/bin/bash
cd ./resources/images
echo "{ \"prizes\": [" > ./manifest.json
cd prizes
i=0
for f in *.png
do
  if [ $i -eq 0 ]; then
    echo \"$f\" >> ../manifest.json
    let i=i+1
    continue
  fi
  echo ,\"$f\" >> ../manifest.json
done;
echo "], \"candies\": [" >> ../manifest.json
cd ../candy;
i=0
for f in *.png
do
  if [ $i -eq 0 ]; then
    echo \"$f\" >> ../manifest.json
    let i=i+1
    continue
  fi
  echo ,\"$f\" >> ../manifest.json
done;
cd ../;
echo "]}" >> ./manifest.json
yarn prettier --write ./resources/images/manifest.json