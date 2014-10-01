
while true; do
    inotifywait -r -e modify src/ test/ && \
	make dist/testable.js
done
