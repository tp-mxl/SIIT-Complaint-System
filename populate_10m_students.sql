DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GenerateStudents`()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE student_id_int INT DEFAULT 10000000;
    DECLARE hashed_pass VARCHAR(255) DEFAULT '$2y$10$LezBVDJU0Uqrt9FvL0AO0u6XHryW4Kwe1NDbKCOsH8cXH4TBDvxLC';

    -- Loop 10 million times
    WHILE i < 10000000 DO
        -- *** THIS IS THE CORRECTED LINE ***
        INSERT INTO student (StudentID, Password, StudentName, Year, Department)
        VALUES (
            CAST(student_id_int AS CHAR), 
            hashed_pass, 
            CONCAT('Generated Student ', i), -- This is the value for StudentName
            FLOOR(1 + RAND() * 4), 
            ELT(FLOOR(1 + RAND() * 8), 'BA', 'CE', 'CHE', 'CPE', 'DE', 'EE', 'IE', 'ME')
        );
        SET i = i + 1;
        SET student_id_int = student_id_int + 1;
    END WHILE;
END$$
DELIMITER ;