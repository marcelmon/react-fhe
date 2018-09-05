
"""
Very simple HTTP server in python.
Usage::
    ./dummy-web-server.py [<port>]
Send a GET request::
    curl http://localhost
Send a HEAD request::
    curl -I http://localhost
Send a POST request::
    curl -d "foo=bar&bin=baz" http://localhost
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver
import cgi
import fhe
import urllib
import json

from xnor_no_spark import XnorSearch as XnorSearch

class S(BaseHTTPRequestHandler):

	def _bad_params(self):
		self.send_response(422)
		self.send_header('Content-type', 'text/html')
		self.end_headers()


	def _internal_err(self):	
		self.send_response(500)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	def _set_headers(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	def _set_headers_json(self):
		self.send_response(200)
		self.send_header('Content-type', 'application/json')
		self.end_headers()

	def do_GET(self):
		self._set_headers()
		self.wfile.write( ("NO GET!").encode('utf-8'))

	def do_HEAD(self):
		self._set_headers()

	def do_POST(self):
		length = int(self.headers['Content-Length'])
		# post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
		post_data = json.loads(self.rfile.read(length).decode('utf-8'))


		# self._set_headers()
		form = cgi.FieldStorage(
			# fp=self.rfile,
			# headers=self.headers,
			# environ={'REQUEST_METHOD': 'POST'}
		)
		operation 	= post_data['operation']

		ret = None;

		if operation == 'cryptocontext':
			ret = fhe.generateCryptoContextToStringSerialization()
			ret = json.dumps(ret)
		elif operation == 'keygen':
			ret = fhe.keygenToStringSerialization(post_data['cryptocontext'])
			ret = json.dumps(ret)
		elif operation == 'encrypt':
			if post_data['isInt'] is True:
				ret = fhe.encryptIntToStringSerialization(post_data['cryptocontext'], post_data['publickey'], post_data['plaintext'], False)
			else:
				ret = fhe.encryptToStringSerialization(post_data['cryptocontext'], post_data['publickey'], post_data['plaintext'], False)
			# json is {'ctext': '...', 'sample':[...]}
			ret = json.dumps(ret)
		elif operation == 'encrypt_with_sample':
			if post_data['isInt'] is True:
				ret = fhe.encryptIntToStringSerialization(post_data['cryptocontext'], post_data['publickey'], post_data['plaintext'], True)
			else:
				ret = fhe.encryptToStringSerialization(post_data['cryptocontext'], post_data['publickey'], post_data['plaintext'], True)
			# json is {'ctext': '...', 'sample':[...]}
			ret = json.dumps(ret)
		elif operation == 'decrypt':
			if post_data['isInt'] is True:
				ret = fhe.decryptIntToStringSerialization(post_data['cryptocontext'], post_data['privatekey'], post_data['ciphertext'])
			else:
				ret = fhe.decryptToStringSerialization(post_data['cryptocontext'], post_data['privatekey'], post_data['ciphertext'])
			ret = json.dumps(ret)
		elif operation == 'query':
			xnorSearch = XnorSearch()

			userId 		= post_data['userId']
			colId 		= post_data['colId']
			ccId 		= post_data['ccId']
			keyId 		= post_data['keyId']
			queryId 	= post_data['queryId']
			dbHost 		= post_data['dbHost']
			dbDatabase 	= post_data['dbDatabase']
			dbUser 		= post_data['dbUser']
			dbPass 		= post_data['dbPass']
			numBits 	= post_data['numBits']

			res = xnorSearch.doXnorSearch(dbHost, dbUser, dbPass, dbDatabase, userId, colId, ccId, keyId, queryId, numBits)
			stringRes = fhe.serializeCiphertext(res)
			ret = json.dumps(stringRes)

		else:
			self._bad_params()
			self.wfile.write(('Bad operation supplied.').encode('utf-8'))
			return

		if not isinstance(ret, str) or (isinstance(ret, int) and ret < 0):
			self._internal_err()
			self.wfile.write(('Invalid return.').encode('utf-8'))
			return

		self._set_headers_json()
		self.wfile.write(ret.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=S, port=8082):
	server_address = ('', port)
	httpd = server_class(server_address, handler_class)
	print('Starting httpd on port ' + str(port) + "...")
	httpd.serve_forever()

if __name__ == "__main__":
	from sys import argv

	if len(argv) == 2:
		run(port=int(argv[1]))
	else:
		run()