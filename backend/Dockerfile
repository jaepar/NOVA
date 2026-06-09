FROM amazoncorretto:21

WORKDIR /app

COPY ./build/libs/*.jar app.jar

EXPOSE 8000
EXPOSE 9000

ENTRYPOINT ["java", "-jar", "app.jar"]