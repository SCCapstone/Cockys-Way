import requests
from bs4 import BeautifulSoup
import json
import base64
import time

# Base URL for the directory
base_url = "https://www.sc.edu/study/colleges_schools/pharmacy/faculty-staff/"
test_url = "https://www.sc.edu"
logo = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5OTUuNSAxOTguMTUiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48Zz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNjMuMzksMzIuOWwuMjQtMS44OCw2LjAzLC4xNCw1LjQ2LS4xNCwuMjQsMS44OC0zLjkxLC42MXYxOC44NGMwLDYuMTctMi41LDEwLjMyLTExLjg3LDEyLjUzLTkuODksMC0xMy4zOC01LjA0LTEzLjM4LTEyLjUzdi0xOC44NHMtNC0uNjEtNC0uNjFsLjI0LTEuODgsNi40NSwuMTQsNi45Mi0uMTQsLjI0LDEuODgtMy43MiwuNjF2MTkuMjdjMCw1Ljc1LDIuNDUsOS4wOSw3LjY4LDkuMDksNC44NSwwLDcuNDktMy4zNCw3LjQ5LTkuMjN2LTE5LjEzcy00LjEtLjYxLTQuMS0uNjFaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjkwLjEzLDYxLjU5bDMuNzcsLjYxLS4xOSwxLjg4LTUuMDktLjE0LTUuNTYsLjE0LS4yNC0xLjg4LDQtLjYxdi0yNy44NHMtMy44Ni0uODUtMy44Ni0uODVsLjI0LTEuODgsNC4xNSwuMTQsNC4xOS0uMTQsMTUuODgsMjEuNTgsMS4xMywzLjM0di0yMi40MnMtMy43Ny0uNjEtMy43Ny0uNjFsLjE5LTEuODgsNS4wOSwuMTQsNS41Ni0uMTQsLjI0LDEuODgtNCwuNjF2MzAuNjJzLTMuMiwwLTMuMiwwbC0xNy41Ny0yNC40NS0uOTQtMy43MnYyNS42M1oiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zMzAuMjYsNjMuOTRsLTYuNzQsLjE0LS4yNC0xLjkzLDQtLjYxdi0yOC4wM3MtNC0uNjEtNC0uNjFsLjI0LTEuODgsNi43NCwuMTQsNi43NC0uMTQsLjI0LDEuODgtNCwuNjF2MjguMDNzNCwuNjEsNCwuNjFsLS4yNCwxLjkzLTYuNzQtLjE0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTM1OS44NCw2NC43OWwtMTEuOTItMzEuMzMtMy40NC0uNTcsLjI0LTEuODgsNy4zLC4xNCw1Ljk4LS4xNCwuMjQsMS44OC0zLjc3LC42MSw4LjA2LDIyLjQ3LC4xNCwyLjgzLDguOTUtMjUuMy0zLjkxLS42MSwuMjQtMS44OCw1LjMyLC4xNCw0LjktLjE0LC4yNCwxLjg4LTMuMzQsLjU3LTExLjQ5LDMwLjItMy43MiwxLjEzWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQwOS42OCwzMS4wMmwuNDcsOC43MWgtMS45M3MtMi43My02LjEyLTIuNzMtNi4xMmwtMTEuODItLjE0djEyLjE1czYuMDgtLjE5LDYuMDgtLjE5bDEuODgtNC45OWgxLjk4cy0uNDcsNi4xMi0uNDcsNi4xMmwuNDcsNi41aC0xLjk4cy0xLjg4LTQuOTktMS44OC00Ljk5bC02LjA4LS4xOXYxMy43NnMxMi4zNC0uMTQsMTIuMzQtLjE0bDMuMTYtNi4zNmgyLjEycy0xLjYsOC45NS0xLjYsOC45NWwtMTkuMjItLjE0LTYuNSwuMTQtLjI0LTEuODgsNC0uNjF2LTI4LjA4cy00LS42MS00LS42MWwuMjQtMS44OCw2LjUsLjE0LDE5LjIyLS4xNFoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00MjguMyw0OC45NnYxMi42M3MzLjgyLC42MSwzLjgyLC42MWwtLjI0LDEuODgtNi41NS0uMTQtNi43NCwuMTQtLjI0LTEuODgsNC0uNjF2LTI4LjA4cy00LS42MS00LS42MWwuMjQtMS44OCw2Ljc0LC4xNCw5LjQyLS4xNGM1Ljk0LS4wNSwxMC42LDIuNjksMTAuNiw4LjIsMCw1LjIzLTQuODUsNy44Ny05Ljk5LDkuMDRsNC4wNSwyLjEyLDcuNjMsMTEuMTYsMi40LC43MS0uMTksMS44NC00LjQzLS4xNC0zLjUzLC4xNC05LjYxLTE0LjYtLjU3LS41MmgtMi44M1ptMC0yLjRoMy4yYzQuMzMsMCw3LjM1LTIuODMsNy4zNS03LjAyLDAtNC4yNC0yLjc4LTYuMzYtNi4zNi02LjQxbC00LjE5LC4zM3YxMy4xWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ1OS41OCw1OC45YzEuNDYsMS43LDMuODYsMy4wNiw2LjUsMy4wNiwzLjY3LDAsNS45NC0yLjI2LDUuOTQtNS41NiwwLTIuNzgtMS43OS00LjU3LTQuNjItNS44NGwtNS43LTIuNjRjLTMuNjMtMS42NS02LjMxLTMuOTEtNi4zMS04LjA2LDAtNC44LDQuMTUtOC4wNiwxMS42OC05LjY2LDMuMTYsMCw2LjY0LDEuMDQsOS4wOSwyLjczdjYuNzhzLTIuNzgsMC0yLjc4LDBsLTEuMzctNC4yOWMtMS4yMi0xLjMyLTIuODMtMi40LTUuNTYtMi40LTMuNTgsMC01LjY1LDEuOTMtNS42NSw0LjcxLDAsMi4zNiwxLjY1LDMuODYsNC4xLDQuOTlsNS43NSwyLjU5YzQuMzgsMi4wNyw3LjAyLDQuNDMsNi45Nyw4Ljg2LDAsNC44NS0zLjU4LDguNzEtMTIuMzQsMTAuNjktNC4xLDAtNy4yNS0xLjI3LTkuODktMy4ybC0xLjA0LTYuOTNoMy42M3MxLjYsNC4xNSwxLjYsNC4xNVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00OTEuOTUsNjMuOTRsLTYuNzQsLjE0LS4yNC0xLjkzLDQtLjYxdi0yOC4wM3MtNC0uNjEtNC0uNjFsLjI0LTEuODgsNi43NCwuMTQsNi43NC0uMTQsLjI0LDEuODgtNCwuNjF2MjguMDNzNCwuNjEsNCwuNjFsLS4yNCwxLjkzLTYuNzQtLjE0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTUyOC4xNiw2NC4wOWwtNy45Ni0uMTQtOC4xNSwuMTQtLjI0LTEuODgsNS40Mi0uNjF2LTI4LjA4cy02LjUsLjA5LTYuNSwuMDlsLTIuMjYsNi4yNmgtMi4wN3YtOC44NnMxMy45LC4xNCwxMy45LC4xNGwxMy43MS0uMTR2OC44NnMtMi4xMiwwLTIuMTIsMGwtMi4yMS02LjI2LTYuNS0uMDl2MjguMDhzNS4yMywuNjEsNS4yMywuNjFsLS4yNCwxLjg4WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTU2MC43LDUxLjE4bC4wNSwxMC40MSw1LjI4LC42MS0uMjQsMS44OC04LjAxLS4xNC04LjIsLjE0LS4yNC0xLjg4LDUuNDYtLjYxdi0xMC41NXMtMTAuNDEtMTcuNjItMTAuNDEtMTcuNjJsLTMuNDQtLjU3LC4yNC0xLjg0LDYuNjksLjE0LDYuNTUtLjE0LC4yNCwxLjg0LTMuNzcsLjYxLDcuODcsMTMuMjgsLjI0LDIuMDMsOC4yLTE1LjMxLTMuODYtLjYxLC4yNC0xLjg0LDUuNDIsLjE0LDUuMDQtLjE0LC4yNCwxLjg0LTMuNDQsLjUyLTEwLjEzLDE3LjgxWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTYzMC45Nyw0Ni44YzAsMTAuNDEtNS4yMywxNS45Ny0xNy40MywxOC4wOS05Ljg1LDAtMTYuMzktNy4wNy0xNi4zOS0xNi41OCwwLTEwLjQxLDUuMjMtMTUuOTcsMTcuNDMtMTguMDksOS44NSwwLDE2LjM5LDcuMDcsMTYuMzksMTYuNThabS0xNi4yNSwxNS4yNmM2LjgzLDAsOS43NS01Ljk4LDkuNzUtMTMuNzEsMC02LjkzLTMuMDEtMTUuMzEtMTEuMDItMTUuMzEtNi44MywwLTkuOCw1Ljk0LTkuOCwxMy42NiwwLDcuMTEsMy4xMSwxNS4zNiwxMS4wNywxNS4zNloiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik02MzguMDMsNjQuMDlsLS4yNC0xLjg4LDQtLjYxdi0yOC4wOHMtNC0uNjEtNC0uNjFsLjI0LTEuODgsNi41LC4xNCwxOS4yMi0uMTQsLjQ3LDguODZoLTEuOTNzLTIuNzMtNi4yNi0yLjczLTYuMjZsLTExLjgyLS4xNHYxMi44MXM2LjA4LS4xOSw2LjA4LS4xOWwxLjg4LTQuOTVoMS45OHMtLjQ3LDYuMTItLjQ3LDYuMTJsLjQ3LDYuNWgtMS45OHMtMS44OC00Ljk5LTEuODgtNC45OWwtNi4wOC0uMTl2MTNzNS42NSwuNjEsNS42NSwuNjFsLS4yNCwxLjg4LTguNjItLjE0LTYuNSwuMTRaIi8+PC9nPjxnPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxOTguMTUiIGhlaWdodD0iMTk4LjE1Ii8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTk0LjY1LDMuNVYxOTQuNjVIMy41VjMuNUgxOTQuNjVtMy41LTMuNUgwVjE5OC4xNUgxOTguMTVWMGgwWiIvPjwvZz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xNDMuMjIsMTEzLjE3di0xMC4xMXMtMTEuMDktMTMuNTUtMjYuNjEtMTMuNTVjLTExLjg3LDAtMTcuMzQsNi45OC0xNy4zNCw2Ljk4LDAsMC01LjQ3LTYuOTgtMTcuMzQtNi45OC0xNS41MSwwLTI2LjYxLDEzLjU1LTI2LjYxLDEzLjU1djEwLjExczEyLjY2LTIwLjU3LDMxLjEyLTIwLjU3YzYuOTgsMCwxMi44NCw2LjI1LDEyLjg0LDYuMjUsMCwwLDUuODYtNi4yNSwxMi44NC02LjI1LDE4LjQ2LDAsMzEuMTIsMjAuNTcsMzEuMTIsMjAuNTdabS0zNi42MSwxNS4yOWguMDNsMy4xNi03LjY2aC0zLjE2bDMuMTYtNy42NmgtMy4xNmwyLjU0LTYuMTVjNi4zLDIuMzMsMTAuNjksMTEuMjMsMTAuNjksMTEuMjN2LTcuMzhjLTUuMi03LjE0LTEzLjY0LTUuMzYtMTMuNjQtNS4zNmwtMy4xNiw3LjY2aDMuMTZsLTMuMTYsNy42NmgzLjE2bC0zLjE2LDcuNjZoLS4wOXYyNy4xOGw1LjI2LDguNDFoMy44M2wtNS4xNi04Ljc5aDcuOTl2LTEuODloLTguMjh2LTI0LjkxWm0tLjE4LTI4LjkxYzE4LjcsMCwyNC40MSwxNy44MiwyNC40MSwxNy44MnYtOS41MmMtNi4xMi03Ljg5LTExLjk4LTkuNDUtMTcuMTgtOS41Mi00LjEzLS4wNS03LjIzLDEuMjEtNy4yMywxLjIxWm0zMC40OCwyNC45MWwxLjU3LTMuNjRoLTIwLjQ0bDEuNTcsMy42NGgxNy4zWm0yOC44MSwxNy4zOHYzLjQ1aC03LjA3di04LjI4aC0zLjYzdjguMjhoLTcuMDd2LTEzLjJoLTMuNjR2MTMuMmgtNy40di0xOC4zMmgtMTcuMzR2MzcuMjNoMy42NHYtMzMuNTloMTAuMDd2MzMuNTloMy42M3YtMTcuMDFoNy40djE3LjAxaDMuNjR2LTE3LjAxaDcuMDd2MTcuMDFoMy42M3YtMTcuMDFoNy4wN3YxNy4wMWgzLjY0di0yMi4zNWgtMy42NFpNOTkuMjcsNjhjMC0yLjIsOS4yMS0yMSwyNS4zMS0yNS41NXYtOC42MWMtMTIuMDgsMy4wNy0yNS4zMSwyMy40NC0yNS4zMSwzMS40OSwwLTguMDUtMTMuMjMtMjguNDItMjUuMzEtMzEuNDl2OC42MWMxNi4xLDQuNTUsMjUuMzEsMjMuMzUsMjUuMzEsMjUuNTVabTAsOS4yN3MxMC44NC0yMi4xNCwzOS4zMi0yMi4xNHYtOC43NWMtMjYuOTMsMC0zOS4zMiwyNy40Ny0zOS4zMiwyNy40NywwLDAtMTIuNC0yNy40Ny0zOS4zMi0yNy40N3Y4Ljc1YzI4LjQ4LDAsMzkuMzIsMjIuMTQsMzkuMzIsMjIuMTRabS02Ljk2LDQzLjU0aDMuMTZsLTMuMTYtNy42NmgzLjE2bC0zLjE2LTcuNjZzLTguNDQtMS43OS0xMy42NCw1LjM2djcuMzhzNC4zOS04LjksMTAuNjktMTEuMjNsMi41NCw2LjE1aC0zLjE2bDMuMTYsNy42NmgtMy4xNmwzLjE2LDcuNjZoLjAzdjI0LjkxaC04LjI4djEuODloNy45OWwtNS4xNiw4Ljc5aDMuODNsNS4yNi04LjQxdi0yNy4xOGgtLjA5bC0zLjE2LTcuNjZabS0yMy42OS01MC4xNWMxNy44OSwwLDMwLjY1LDE0Ljg5LDMwLjY1LDE0Ljg5LDAsMCwxMi43Ni0xNC44OSwzMC42NS0xNC44OSwxMC4xNywwLDE3LjAzLDQuNDIsMTcuMDMsNC40MmwuMDMtOS44MnMtNy4zNC0yLjI5LTEzLjQzLTIuMjljLTIzLjE3LDAtMzQuMjgsMTkuODktMzQuMjgsMTkuODksMCwwLTExLjEtMTkuODktMzQuMjgtMTkuODktNi4wOSwwLTEzLjQzLDIuMjktMTMuNDMsMi4yOWwuMDMsOS44MnM2Ljg2LTQuNDIsMTcuMDMtNC40MlptMzAuNjUtMTQuOTFzLjItMTMuNCwxMS40NS0xOC44OGMuMDYtNC4zNywuMDYtNy42MywuMDYtNy42My0xMS4xMiw1LjYyLTExLjUxLDIwLjM2LTExLjUxLDIwLjM2LDAsMC0uMzktMTQuNzQtMTEuNTEtMjAuMzYsMCwwLDAsMy4yNSwuMDYsNy42MywxMS4yNSw1LjQ4LDExLjQ1LDE4Ljg4LDExLjQ1LDE4Ljg4Wk02MS42MiwxMjQuNDZoMTcuM2wxLjU3LTMuNjRoLTIwLjQ0bDEuNTcsMy42NFptMjMuMjUtMjYuMTJjLTUuMiwuMDctMTEuMDYsMS42My0xNy4xOCw5LjUydjkuNTJzNS43Mi0xNy44MiwyNC40MS0xNy44MmMwLDAtMy4xLTEuMjctNy4yMy0xLjIxWm0tNi4wNS0xNS40OGMxMi44Ni0uMDQsMjAuNDQsOS4zNywyMC40NCw5LjM3LDAsMCw3LjU4LTkuNDEsMjAuNDQtOS4zNywxOC42LC4xNiwzMi4yNSwxNi45NiwzMi4yNSwxNi45NnYtMTIuMTlzLTExLjA5LTkuMzctMjguNTEtOS4zN2MtMTUuNzYsMC0yNC4xOSwxMS41OC0yNC4xOSwxMS41OCwwLDAtOC40Mi0xMS41OC0yNC4xOS0xMS41OC0xNy40MiwwLTI4LjUxLDkuMzctMjguNTEsOS4zN3YxMi4xOXMxMy42NS0xNi44LDMyLjI1LTE2Ljk2Wm0tMTcuMjEsNjIuNDNoLTcuNHYtMTMuMmgtMy42NHYxMy4yaC03LjA3di04LjI4aC0zLjYzdjguMjhoLTcuMDd2LTMuNDVoLTMuNjR2MjIuMzVoMy42NHYtMTcuMDFoNy4wN3YxNy4wMWgzLjYzdi0xNy4wMWg3LjA3djE3LjAxaDMuNjR2LTE3LjAxaDcuNHYxNy4wMWgzLjYzdi0zMy41OWgxMC4wN3YzMy41OWgzLjY0di0zNy4yM2gtMTcuMzR2MTguMzJaIi8+PGc+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjU0LjQ4LDE1Mi43YzMuNzIsNC4zMiw5LjgzLDcuNzksMTYuNTUsNy43OSw5LjM1LDAsMTUuMTEtNS43NiwxNS4xMS0xNC4xNSwwLTcuMDgtNC41Ni0xMS42My0xMS43NS0xNC44N2wtMTQuNTEtNi43MmMtOS4yMy00LjItMTYuMDctOS45NS0xNi4wNy0yMC41MSwwLTEyLjIzLDEwLjU1LTIwLjUxLDI5Ljc0LTI0LjU4LDguMDMsMCwxNi45MSwyLjY0LDIzLjE0LDYuOTZ2MTcuMjdoLTcuMDhsLTMuNDgtMTAuOTFjLTMuMTItMy4zNi03LjE5LTYuMTEtMTQuMTUtNi4xMS05LjExLDAtMTQuMzksNC45Mi0xNC4zOSwxMS45OSwwLDYsNC4yLDkuODMsMTAuNDMsMTIuNzFsMTQuNjMsNi42YzExLjE1LDUuMjgsMTcuODcsMTEuMjcsMTcuNzUsMjIuNTQsMCwxMi4zNS05LjExLDIyLjE4LTMxLjQyLDI3LjIyLTEwLjQzLDAtMTguNDctMy4yNC0yNS4xOC04LjE1bC0yLjY0LTE3LjYzaDkuMjNsNC4wOCwxMC41NVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zNjQuMDYsMTM0LjM3YzAsMTguNzEtMTIuMzUsMjkuOTctMzAuNTgsMzMuMi0xNS43MSwwLTI2Ljg2LTEzLjc4LTI2Ljg2LTMwLjQ0LDAtMTguOTUsMTIuMzUtMjkuOTcsMzAuNTgtMzMuMzIsMTUuNzEsMCwyNi44NiwxMy43OCwyNi44NiwzMC41N1ptLTI3LjIyLDI2Ljg1YzguMDMsMCwxMi40Ny05Ljk0LDEyLjQ3LTIzLjEzLDAtMTYuNjctNi43Mi0yNy45My0xNS41OS0yNy45My04LjE1LDAtMTIuNDcsOS45NC0xMi40NywyMy4xMywwLDE1LjU5LDYuNDgsMjcuOTMsMTUuNTksMjcuOTNaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNDIzLjEsMTQ5Ljk0YzAsNC45MiwuNiw2Ljg0LDEuNTYsOC43NWg1LjUybC40OCw0LjgtMTcuMjcsMy4yNC0zLjQ4LTEwLjA3LTE3LjE1LDEwLjkxYy0xNS4yMywwLTE4LjgzLTUuMDQtMTguODMtMTkuMDd2LTM0Ljg3bC03LjY3LC42LS42LTUuMjgsMTQuOTktMy4yNCw3LjE5LS40OHY0My4wMmMwLDUuNzYsMi40LDguMzksNy45MSw4LjM5LDMuMjQsMCw3LjMxLTIuNCwxMS4yNy01LjA0bDIuMjgtMS41NnYtMzYuNDNsLTYuNzIsLjYtLjYtNS4yOCwxMy45MS0zLjI0LDcuMTktLjQ4djQ0LjdaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNDkyLjU2LDE1OS43OGw2LDEuMzItLjYsNC44LTExLjk5LS4zNi0xNC4yNywuMzYtLjYtNC44LDcuNjctMS4zMlY5MC4yNWwtNy43OSwuMjQtLjYtNC44LDE1LjU5LTMuNiw2LjU5LS40OHYzMy41OGwxNy44Ny0xMS4zOWMxNC43NSwwLDE4LjExLDUuMTYsMTguMTEsMjAuMTV2MzUuODNsOC4yNywxLjMyLS42LDQuOC0xNC4yNy0uMzYtMTIuMTEsLjM2LS42LTQuOCw1LjQtMS4zMnYtMzcuMDNjMC01LjY0LTIuNjQtOC4xNS03LjA4LTguMTUtMy40OCwwLTcuNjcsMi41Mi0xMS43NSw1LjA0bC0zLjI0LDIuMDR2MzguMTFaIi8+PGc+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNjM4LjU2LDEzOS43NWwtMi43NiwxOS4xOWMtNi44NCwzLjEyLTE2LjkyLDcuMzItMjguNDMsOC45OS0xOC4yMiwwLTQwLjQ0LTE0Ljg3LTQwLjQ0LTQyLjY5czE5LjctNDIuMTMsNDMuNDQtNDUuNTdjMTIuMTEsMCwyMSw1LjA0LDI2LjY0LDguNzV2MTguMTFoLTcuNDNsLTMuODQtMTEuMzljLTMuMTItMy44NC03LjY5LTguNTEtMTcuNTItOC41MS0xNi40MywwLTI0LjczLDEyLjU5LTI0LjczLDM1LjM4LDAsMTkuOTEsNy44MiwzOC43MywyNy4wMSwzOC43Myw3LjQzLDAsMTAuOTMtMy45NiwxNC42NC03LjMxbDYuMjQtMTMuNjdoNy4xOVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik02NjguNjIsMTAzLjhjMTUuOTUsMCwyMC41MSw0LjA4LDIwLjUxLDE4LjgzdjI5LjQ3YzAsNS4wNCwuNzIsNy4wNywxLjkyLDguOTloNS44OGwuNiw0LjgtMTcuNzUsMS42OC0zLjg0LTEwLjMxLTE0LjAzLDEwLjMxYy0xMC42NywwLTE4LjIzLTYtMTguMjMtMTUuNzEsMC00LjY4LDEuOC04LjE1LDQuNjgtMTEuNTFsMjYuODYtOC43NXYtOS44MWMwLTcuMTktMS4yLTEwLjU1LTYuNTktMTAuNTUtMywwLTYuMzYsLjk2LTguNzUsMi4wNGwtMS45MiwxMC40M2gtMTIuMzV2LTEwLjA3bDIzLjAyLTkuODNabTYuNTksMzIuODNsLTE1LjIzLDYuMjRjLTEuOCwxLjkyLTIuNTIsNC42OC0yLjUyLDcuMzIsMCw2LDMuMzYsOC4xNSw2LjQ4LDguMTVzNS41Mi0xLjY4LDcuMDgtMi43Nmw0LjItMi44OHYtMTYuMDdaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNzIxLjQxLDEyMi4zOWwxMy4xOS0xNy45OWgxMS45OGwtMy4zMywxNC4wM2gtOC42NWMtMi44OCwuODQtNy4yLDQuNDQtMTAuNDMsOC4xNWwtMi4wNCwyLjR2MzAuNTVsMTIuNzEsMS4yLS42LDUuMTYtMTguNzEtLjM2LTE0LjE1LC4zNi0uNi00LjgsNy43OS0xLjMydi00Ni4xNGwtNy43OSwuNi0uNi00LjkyLDE0Ljk5LTMuNiw1LjUyLS40OCwuNzIsMTcuMTVaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNODAyLjQzLDEzNC4zN2MwLDE4LjcxLTEyLjM1LDI5Ljk3LTMwLjU4LDMzLjItMTUuNzEsMC0yNi44Ni0xMy43OC0yNi44Ni0zMC40NCwwLTE4Ljk1LDEyLjM1LTI5Ljk3LDMwLjU4LTMzLjMyLDE1LjcxLDAsMjYuODYsMTMuNzgsMjYuODYsMzAuNTdabS0yNy4yMiwyNi44NWM4LjAzLDAsMTIuNDctOS45NCwxMi40Ny0yMy4xMywwLTE2LjY3LTYuNzItMjcuOTMtMTUuNTktMjcuOTMtOC4xNSwwLTEyLjQ3LDkuOTQtMTIuNDcsMjMuMTMsMCwxNS41OSw2LjQ4LDI3LjkzLDE1LjU5LDI3LjkzWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTgxNy45MywxNjUuNTNsLTE0LjI3LC4zNi0uNi00LjgsNy42Ny0xLjMyVjkwLjI1bC03Ljc5LC4yNC0uNi00LjkyLDE1LjU5LTMuNiw2LjU5LS40OHY3OC4yOGw4LjI3LDEuMzItLjYsNC44LTE0LjI3LS4zNloiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik04NTMuMDcsMTY1LjUzbC0xNC4yNywuMzYtLjYtNC44LDcuNzktMS4zMnYtNDYuMjZsLTcuNzksLjQ4LS42LTQuOCwxNS41OS0zLjQ4LDYuNi0uNDh2NTQuNTRsOC4xNSwxLjMyLS42LDQuOC0xNC4yNy0uMzZabS02LjQ4LTgyLjc0bDkuODMtLjcyLDMuNiwuNzIsLjcyLDcuMzEtMS40NCw2LjI0LTkuNzEsLjcyLTMuNi0uNzItLjcyLTcuMzIsMS4zMi02LjI0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTg4OC41MywxNjUuNTNsLTE0LjI3LC4zNi0uNi00LjgsNy43OS0xLjMydi00Ni4xNGwtNy45MSwuNi0uNi00LjkyLDE1LjU5LTMuNiw2LjEyLS4zNiwuMzYsOS45NSwxNy45OS0xMS41MWMxNC43NSwwLDE4LjIzLDQuNjgsMTguMjMsMTkuMDd2MzYuOTFsOC4yNywxLjMyLS42LDQuOC0xNC4yNy0uMzYtMTIuMzUsLjM2LS42LTQuOCw1LjUyLTEuMzJ2LTM3LjAzYzAtNS42NC0yLjUyLTguMTUtNy4xOS04LjE1LTMuOTYsMC03Ljc5LDIuNTItMTEuNjMsNS4wNGwtMy4xMiwyLjE2djM3Ljk5bDUuODgsMS4zMi0uNiw0LjgtMTEuOTktLjM2WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTk2Ni42LDEwMy44YzE1Ljk1LDAsMjAuNTEsNC4wOCwyMC41MSwxOC44M3YyOS40N2MwLDUuMDQsLjcyLDcuMDcsMS45Miw4Ljk5aDUuODhsLjYsNC44LTE3Ljc1LDEuNjgtMy44NC0xMC4zMS0xNC4wMywxMC4zMWMtMTAuNjcsMC0xOC4yMy02LTE4LjIzLTE1LjcxLDAtNC42OCwxLjgtOC4xNSw0LjY4LTExLjUxbDI2Ljg2LTguNzV2LTkuODFjMC03LjE5LTEuMi0xMC41NS02LjU5LTEwLjU1LTMsMC02LjM2LC45Ni04Ljc1LDIuMDRsLTEuOTIsMTAuNDNoLTEyLjM1di0xMC4wN2wyMy4wMi05LjgzWm02LjU5LDMyLjgzbC0xNS4yMyw2LjI0Yy0xLjgsMS45Mi0yLjUyLDQuNjgtMi41Miw3LjMyLDAsNiwzLjM2LDguMTUsNi40OCw4LjE1czUuNTItMS42OCw3LjA4LTIuNzZsNC4yLTIuODh2LTE2LjA3WiIvPjwvZz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00NjcuMjIsMTU1Ljc4Yy0yLjUyLDEuMTgtNC43OCwxLjk2LTcuNTgsMS45Ni00LjU2LDAtNi4yNC0zLjQ4LTYuMjQtNy4zMnYtMzkuMzFoMTMuODJ2LTUuODhoLTEzLjk0di0xNC43NWgtNC4ybC05LjIzLDguMjd2NS43NmgtNS40MWwtNC40NCw0LjU2djIuMDRoOS42MXY0MC41MWMwLDExLjYzLDQuOCwxNS45NSwxNi45MSwxNS45NWw5LjkxLTUuNDIsLjc4LTYuMzhaIi8+PC9nPjwvc3ZnPg=="

# Function to fetch and parse HTML content
def get_soup(url):
    response = requests.get(url)
    response.raise_for_status()
    return BeautifulSoup(response.text, 'html.parser')

# Function to encode an image from a URL to Base64
def encode_image_to_base64(image_url):
    try:
        response = requests.get(image_url)
        response.raise_for_status()
        return base64.b64encode(response.content).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image {image_url}: {e}")
        return ""

# Function to extract profile links from the directory page
def extract_profile_links(soup):
    links = []
    for a_tag in soup.select('a[href^="/study/colleges_schools/pharmacy/faculty-staff/"]'):
        href = a_tag.get('href')
        if href and href.endswith('.php'):
            links.append(base_url + href.split('/')[-1])
    return links

# Function to extract data from a faculty profile page
def extract_profile_data(profile_url):
    soup = get_soup(profile_url)
    profile_data = {
        "facOrStaff": "Faculty",  # Assuming Faculty unless specified otherwise
        "name": "",
        "title": "",
        "secTitle": "",
        "phone": "",
        "email": "",
        "keywords": "",
        "tags": "",
        "department": "",
        "college": "College of Arts and Sciences",  # Fixed value
        "image": "",
        "website": "",
        "office": "",
        "officeHours": {
            "monday": "",
            "tuesday": "",
            "wednesday": "",
            "thursday": "",
            "friday": ""
        }
    }

    # Extract the relevant section
    section = soup.find('section', class_='column grid_9')
    if section:
        profile_data["name"] = section.find('h1').get_text(strip=True) if section.find('h1') else ""
        title_div = section.find('div', class_='title')
        if title_div:
            profile_data["title"] = title_div.get_text(strip=True)

        for p_tag in section.find_all('p'):
            text = p_tag.get_text(strip=True)
            if "Phone:" in text:
                profile_data["phone"] = text.replace("Phone:", "").strip()
            elif "Email:" in text:
                email_link = p_tag.find('a', href=True)
                profile_data["email"] = email_link.get_text(strip=True) if email_link else ""
            elif "Office:" in text:
                profile_data["office"] = text.replace("Office:", "").strip()
            elif "Keywords:" in text:
                profile_data["keywords"] = text.replace("Keywords:", "").strip()
            elif "Tags:" in text:
                profile_data["tags"] = text.replace("Tags:", "").strip()

    # Extract image URL and encode to Base64
    image_tag = soup.find('img', {'src': True})
    if image_tag and encode_image_to_base64(test_url + image_tag['src']) != logo:
        image_url = test_url + image_tag['src']
        profile_data["image"] = encode_image_to_base64(image_url)
    else:
        print(f"No image found for {profile_url}")
        profile_data["image"] = ""

    # Extract office information (if present)
    office_section = soup.find('div', class_='office-info')
    if office_section:
        profile_data["office"] = office_section.get_text(strip=True)

    return profile_data

# Main script to scrape and save data
def main():
    all_profiles = []
    profile = 0

    while True:
        print(f"Processing directory page {profile}...")
        directory_url = f"{base_url}index.php"
        soup = get_soup(directory_url)

        # Extract profile links
        profile_links = extract_profile_links(soup)
        if not profile_links:
            break

        # Scrape data from each profile
        for link in profile_links:
            profile += 1
            print(f"Fetching profile: {link} profile: {profile}")
            try:
                profile_data = extract_profile_data(link)
                all_profiles.append(profile_data)
            except Exception as e:
                print(f"Error fetching profile {link}: {e}")
            time.sleep(0.3)  # Respectful delay to avoid overloading the server

        break

    # Save to JSON file
    output_file = "images.json"
    with open(output_file, "w") as json_file:
        json.dump(all_profiles, json_file, indent=4)

    print(f"Data successfully saved to {output_file}")

if __name__ == "__main__":
    main()
