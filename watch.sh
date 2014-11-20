
while true; do
    inotifywait -r -e modify src/ test/ && \
	make all
done
