import os

# Only use PyMySQL locally when MySQL is configured
# On Render, PostgreSQL is used via DATABASE_URL — no PyMySQL needed
if not os.environ.get('DATABASE_URL'):
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass