대충 영단어 시험 내주는 프로그램 - Wordnet 사전을 사용했습니다.

1. 의존성 설치
npm install

2. word_sources.txt에 선택지로 나올 수 있는 단어 입력

그냥 최대한 많은 단어를 넣으면 됩니다. 수준에 맞는걸로. 단어 구분은 엔터로. 공백인 라인 없게. 뜻은 쓰지 않고 영단어만 입력해주세요.

3. Latex 설치 (이게 없으면 pdf 파일이 안 나와요.)

Texlive를 설치하면 됩니다. 설치하기 싫으시다면(엄청 오래 걸려요....) tex이 없어도 tex파일은 일단 생성해주니 그것을 Overleaf같은 tex 온라인 편집기에 넣고 컴파일하면 됩니다.

4. tests 폴더에 연습할 영단어 입력

yyyymmdd.txt의 형식으로 그날 연습할 영단어를 넣습니다. 예시가 하나 있으니 참고해보세요. 넣는 방법은 word_sources하고 같아요.

5. 실행

node app 또는 nodemon app

port.conf에서 포트를 설정하세요. 127.0.0.1로 접속하면 뭔가 나옵니다!



        Based on WordNet
        Citations:
        George A. Miller (1995). WordNet: A Lexical Database for English.
        Communications of the ACM Vol. 38, No. 11: 39-41.
        Christiane Fellbaum (1998, ed.) WordNet: An Electronic Lexical Database. Cambridge, MA: MIT Press.
        WordNet: An Electronic Lexical Database(citation above) is available from MIT Press.
