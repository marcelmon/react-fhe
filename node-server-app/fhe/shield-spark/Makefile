all:
	c++ -O3 -Wall -shared -std=c++11 -fPIC `python3 -m pybind11 --includes` example.cpp -I PALISADE/src/core/lib -L PALISADE/bin/lib -l PALISADEcore -l PALISADEpke -Wl,-rpath=PALISADE/bin/lib -Wl,-rpath=./ -I PALISADE/src/pke/lib -I /opt/local/include/libomp -fopenmp -o example`python3-config --extension-suffix`

# all:
# 	c++ -O3 -Wall -shared -std=c++11 -fPIC `python3 -m pybind11 --includes` palisade.cpp -I PALISADE/src/core/lib -L PALISADE/bin/lib -l PALISADEcore -l PALISADEpke -Wl,-rpath=PALISADE/bin/lib -Wl,-rpath=./ -I PALISADE/src/pke/lib -I /opt/local/include/libomp -fopenmp -o palisade`python3-config --extension-suffix`
