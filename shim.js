// shim.js
import { decode as atob, encode as btoa } from 'base-64';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import { Crypto } from '@peculiar/webcrypto';

global.atob = atob;
global.btoa = btoa;
global.Buffer = Buffer;
global.crypto = new Crypto();